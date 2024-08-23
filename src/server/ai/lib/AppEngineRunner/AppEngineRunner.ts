import { AppEngineType } from '@/components/apps/appsTypes'
import { ensureError } from '@/lib/utils'
import { getAppByIdService } from '@/server/apps/services/getAppById.service'
import { downloadAssetFromS3Service } from '@/server/assets/services/downloadAssetFromS3.service'
import { type UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { getApplicableAppConfigToChatService } from '@/server/chats/services/getApplicableAppConfigToChat.service'
import { getChatByIdService } from '@/server/chats/services/getChatById.service'
import { saveTokenCountService } from '@/server/chats/services/saveTokenCount.service'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { errorLogger } from '@/shared/errors/errorLogger'
import { AssetOnAppStatus } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { Prisma, PrismaClient } from '@prisma/client'
import createHttpError from 'http-errors'
import { aiProvidersFetcherService } from '../../services/aiProvidersFetcher.service'
import type {
  AbstractAppEngine,
  AppEngineRunParams,
  EngineAppKeyValues,
} from '../AbstractAppEngine'
import { AppEngineResponseStream } from '../AppEngineResponseStream'
import { AppEnginePayloadBuilder } from './AppEnginePayloadBuilder'
import { chatTitleCreateService } from './chatTitleCreate.service'

export class AppEngineRunner {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly context: UserOnWorkspaceContext,
    private readonly engines: AbstractAppEngine[],
  ) {}

  async call(chatId: string): Promise<ReadableStream<Uint8Array>> {
    let hoistedCtx:
      | AppEngineRunParams<EngineAppKeyValues, Record<string, string>>
      | undefined = undefined
    try {
      await this.validateUserHasPermissionsOrThrow(chatId)
      await this.maybeAttachAppConfigVersionToChat(chatId)

      const chat = await this.getChat(chatId)
      const ctx = await this.generateChatScopedEngineContext(chatId)

      await this.validateModelIsEnabledOrThrow(ctx.providerSlug, ctx.modelSlug)

      const rawMessageIds = ctx.rawMessages.map((message) => message.id)
      const chatRun = await this.createChatRun(chatId, rawMessageIds)

      const finalCtx = {
        ...ctx,
        chatRunId: chatRun.id,
      }

      hoistedCtx = finalCtx

      const callbacks = this.getCallbacks(ctx.targetAssistantRawMessage.id)

      const processUsage = async (
        requestTokens: number,
        responseTokens: number,
      ) => {
        await this.processUsage(chatRun.id, requestTokens, responseTokens)
      }

      // TODO: Should be a cron job
      void this.handleTitleCreate(chatId)

      const engine = await this.getEngine(chat.appId)

      await this.validateCtxPayloads(engine, finalCtx)

      return AppEngineResponseStream(
        {
          threadId: chatId,
          messageId: ctx.targetAssistantRawMessage.id,
          chatRunId: chatRun.id,
        },
        callbacks,
        async ({ pushText }) => {
          await engine.run(finalCtx, { pushText, usage: processUsage })
        },
      )
    } catch (error) {
      if (hoistedCtx?.targetAssistantRawMessage.id)
        await this.deleteMessage(hoistedCtx.targetAssistantRawMessage.id)
      throw error
    }
  }

  async onAppCreated(appId: string) {
    const engine = await this.getEngine(appId)
    const ctx = await this.generateAppScopedEngineContext(appId)

    await engine.onAppCreated(ctx)
  }

  async onAppDeleted(appId: string) {
    const engine = await this.getEngine(appId)
    const ctx = await this.generateAppScopedEngineContext(appId)

    await engine.onAppDeleted(ctx)
  }

  async onAssetAdded(assetOnAppId: string) {
    const assetOnApp = await this.prisma.assetsOnApps.findUniqueOrThrow({
      where: {
        id: assetOnAppId,
        markAsDeletedAt: null,
      },
    })

    const appId = assetOnApp.appId
    const assetId = assetOnApp.assetId

    const engine = await this.getEngine(appId)
    const ctx = await this.generateAppScopedEngineContext(appId)

    const { filePath, deleteFile: deleteLocalFileCopy } =
      await this.pullAssetFromRemote(assetId)

    let onSuccessHasBeenCalled = false
    let onFailureHasBeenCalled = false

    const onSuccess = async (externalId?: string) => {
      if (onFailureHasBeenCalled) return
      onSuccessHasBeenCalled = true
      if (externalId) {
        await this.saveExternalAssetId(assetOnAppId, externalId)
      }
      await this.updateAssetOnApp(assetOnAppId, {
        status: AssetOnAppStatus.Success,
      })
    }
    const onFailure = async (failureMessage: string) => {
      if (onSuccessHasBeenCalled) return
      onFailureHasBeenCalled = true

      await this.updateAssetOnApp(assetOnAppId, {
        status: AssetOnAppStatus.Failed,
        failureMessage,
      })
    }

    try {
      await engine.onAssetAdded(
        ctx,
        { filePath, assetOnAppId: assetOnApp.id },
        { onSuccess, onFailure },
      )
    } catch (_error) {
      const error = ensureError(_error)
      await deleteLocalFileCopy()
      await this.updateAssetOnApp(assetOnAppId, {
        status: AssetOnAppStatus.Failed,
        failureMessage: 'Server error while attaching asset',
      })
      throw error
    }

    await deleteLocalFileCopy()

    if (!onSuccessHasBeenCalled && !onFailureHasBeenCalled) {
      throw createHttpError(
        500,
        `a success or failure callback should have been called on the engine when attaching an asset. Engine: ${engine.getName()}`,
      )
    }
  }

  async onAssetRemoved(assetOnAppId: string) {
    const assetOnApp = await this.prisma.assetsOnApps.findFirstOrThrow({
      where: {
        id: assetOnAppId,
        markAsDeletedAt: {
          not: null,
        },
      },
    })

    const appId = assetOnApp.appId
    const assetId = assetOnApp.assetId
    const externalId = assetOnApp.externalId

    if (!externalId) {
      return
    }

    const ctx = await this.generateAppScopedEngineContext(appId)

    const engine = await this.getEngine(appId)
    await engine.onAssetRemoved(ctx, externalId)
  }

  private async getChat(chatId: string) {
    return await getChatByIdService(this.prisma, this.context, {
      chatId,
      includeApp: true,
    })
  }

  private async getEngine(appId: string) {
    const app = await getAppByIdService(this.prisma, this.context, {
      appId,
    })

    const engineType = app.engineType

    if (engineType === AppEngineType.Default.toString()) {
      return this.getDefaultEngine()
    }

    const engine = this.getEngineByName(engineType)
    if (!engine) {
      throw createHttpError(500, `${engineType} does not exist`)
    }

    return engine
  }

  private getEngineByName(name: string) {
    const engine = this.engines.find((engine) => engine.getName() === name)
    if (!engine) {
      throw new Error(`Engine "${name}" not found`)
    }
    return engine
  }

  private getDefaultEngine() {
    const engine = this.engines.find(
      (engine) => engine.getName() === AppEngineType.Default.toString(),
    )
    if (!engine) {
      throw createHttpError(500, `Default engine not found`)
    }
    return engine
  }

  private async validateUserHasPermissionsOrThrow(chatId: string) {
    const { userId } = this.context
    const chat = await this.prisma.chat.findFirstOrThrow({
      where: {
        id: chatId,
      },
      include: {
        app: true,
      },
    })

    await new PermissionsVerifier(this.prisma).passOrThrowTrpcError(
      PermissionAction.Use,
      userId,
      chat.appId,
    )
  }

  private async maybeAttachAppConfigVersionToChat(chatId: string) {
    const chat = await getChatByIdService(this.prisma, this.context, {
      chatId,
    })

    if (!chat.appConfigVersionId) {
      const appConfigVersion = await getApplicableAppConfigToChatService(
        this.prisma,
        this.context,
        {
          chatId,
        },
      )

      await this.attachAppConfigVersionToChat(chatId, appConfigVersion.id)
    }
  }

  private async validateModelIsEnabledOrThrow(
    providerName: string,
    modelName: string,
  ) {
    const { workspaceId, userId } = this.context

    const providersMeta =
      await aiProvidersFetcherService.getFullAiProvidersMeta(
        workspaceId,
        userId,
      )

    const provider = providersMeta.find(
      (providerMeta) => providerMeta.slug === providerName,
    )

    if (!provider) {
      throw createHttpError(
        403,
        `The model provider ${providerName} no longer exists. Please select another one.`,
      )
    }

    const targetModel = provider.models.find(
      (model) => model.slug === modelName,
    )

    if (!targetModel) {
      throw createHttpError(
        403,
        `The model "${providerName}/${modelName}" no longer exists. Please select another one.`,
      )
    }

    if (!targetModel.isEnabled) {
      throw createHttpError(
        403,
        `The model "${targetModel.fullPublicName}" is currently not enabled. Please select another one.`,
      )
    }

    if (!targetModel.isSetupOk) {
      throw createHttpError(
        403,
        `The model "${targetModel.fullPublicName}" is not setup correctly. Please select another one.`,
      )
    }

    return true
  }

  private async handleTitleCreate(chatId: string) {
    return await chatTitleCreateService(this.prisma, this.context, { chatId })
  }

  private async pullAssetFromRemote(assetId: string) {
    return await downloadAssetFromS3Service(this.prisma, this.context, {
      assetId,
    })
  }

  private async generateAppScopedEngineContext(appId: string) {
    const appEnginePayloadBuilder = new AppEnginePayloadBuilder(
      this.prisma,
      this.context,
    )
    return await appEnginePayloadBuilder.buildForApp(appId)
  }

  private async generateChatScopedEngineContext(chatId: string) {
    const appEnginePayloadBuilder = new AppEnginePayloadBuilder(
      this.prisma,
      this.context,
    )
    return await appEnginePayloadBuilder.buildForChat(chatId)
  }

  private async createChatRun(chatId: string, messageIds: string[]) {
    return await this.prisma.chatRun.create({
      data: {
        chatId,
        chatRunMessages: {
          create: messageIds.map((messageId) => ({
            messageId,
          })),
        },
      },
    })
  }

  private async attachAppConfigVersionToChat(
    chatId: string,
    appConfigVersionId: string,
  ) {
    await this.prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        appConfigVersionId,
      },
    })
  }

  private async saveMessage(
    targetAssistantMessageId: string,
    fullMessage: string,
  ) {
    await this.prisma.message.update({
      where: {
        id: targetAssistantMessageId,
      },
      data: {
        message: fullMessage,
      },
    })
  }

  private async deleteMessage(targetAssistantMessageId: string) {
    await this.prisma.message.delete({
      where: {
        id: targetAssistantMessageId,
      },
    })
  }

  private async processUsage(
    chatRunId: string,
    requestTokens: number,
    responseTokens: number,
  ) {
    await saveTokenCountService(this.prisma, this.context, {
      chatRunId,
      requestTokens,
      responseTokens,
    })
  }

  private async saveExternalAssetId(assetOnAppId: string, externalId: string) {
    await this.prisma.assetsOnApps.update({
      where: {
        id: assetOnAppId,
      },
      data: {
        externalId,
      },
    })
  }

  private async validateCtxPayloads(
    engine: AbstractAppEngine,
    ctx: AppEngineRunParams<EngineAppKeyValues, Record<string, string>>,
  ) {
    await engine.getProviderKeyValuesSchema().parseAsync(ctx.providerKVs)
    await engine.getAppKeyValuesSchema().parseAsync(ctx.appKeyValuesStore)
  }

  private async updateAssetOnApp(
    assetOnAppId: string,
    data: Prisma.AssetsOnAppsUpdateInput,
  ) {
    return await this.prisma.assetsOnApps.update({
      where: {
        id: assetOnAppId,
      },
      data,
    })
  }

  private getCallbacks(targetAssistantMessageId: string) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onToken: () => {},
      onError: async (error: Error, partialResult: string) => {
        if (partialResult) {
          await this.saveMessage(targetAssistantMessageId, partialResult)
        }

        await this.deleteMessage(targetAssistantMessageId)
        // This errorLogger is important. It's the last place we have to
        // catch errors happening in the stream before they are converted
        // into ai-sdk-like errors (a string that starts with "3: <error message>")
        errorLogger(error)
      },
      onFinal: async (fullMessage: string) => {
        await this.saveMessage(targetAssistantMessageId, fullMessage)
      },
    }
  }
}
