import { AppEngineType } from '@/components/apps/appsTypes'
import { createReadStreamSafe } from '@/lib/backend/nodeUtils'
import { getAppByIdService } from '@/server/apps/services/getAppById.service'
import { downloadAssetFromS3Service } from '@/server/assets/services/downloadAssetFromS3.service'
import { type UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { getApplicableAppConfigToChatService } from '@/server/chats/services/getApplicableAppConfigToChat.service'
import { getChatByIdService } from '@/server/chats/services/getChatById.service'
import { saveTokenCountService } from '@/server/chats/services/saveTokenCount.service'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { errorLogger } from '@/shared/errors/errorLogger'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { PrismaClient } from '@prisma/client'
import createHttpError from 'http-errors'
import { aiProvidersFetcherService } from '../../services/aiProvidersFetcher.service'
import type {
  AbstractAppEngine,
  AllowedKVS,
  AppEngineRunParams,
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
    let hoistedCtx: AppEngineRunParams<AllowedKVS> | undefined = undefined
    try {
      await this.validateUserHasPermissionsOrThrow(chatId)
      await this.maybeAttachAppConfigVersionToChat(chatId)

      const chat = await this.getChat(chatId)
      const ctx = await this.generateChatScopedEngineContext(chatId)
      hoistedCtx = ctx

      const rawMessageIds = ctx.rawMessages.map((message) => message.id)
      const chatRun = await this.createChatRun(chatId, rawMessageIds)

      const callbacks = this.getCallbacks(ctx.targetAssistantRawMessage.id)

      let hasProcessUsageBeenCalled = false
      const processUsage = async (
        requestTokens: number,
        responseTokens: number,
      ) => {
        hasProcessUsageBeenCalled = true
        await this.processUsage(chatRun.id, requestTokens, responseTokens)
      }

      // TODO: Should be a cron job
      void this.handleTitleCreate(chatId)

      const engine = await this.getEngine(chat.appId)

      return AppEngineResponseStream(
        {
          threadId: chatId,
          messageId: ctx.targetAssistantRawMessage.id,
          chatRunId: chatRun.id,
        },
        callbacks,
        async ({ pushText }) => {
          await engine.run(ctx, { pushText, usage: processUsage })

          if (!hasProcessUsageBeenCalled) {
            throw createHttpError(
              500,
              `usage callback was not called on engine when finishing a chat run. Engine: ${engine.getName()}`,
            )
          }
        },
      )
    } catch (error) {
      if (hoistedCtx?.targetAssistantRawMessage.id)
        await this.deleteMessage(hoistedCtx.targetAssistantRawMessage.id)
      throw error
    }
  }

  async attachAsset(appId: string, assetId: string) {
    const assetOnApp = await this.prisma.assetsOnApps.findFirstOrThrow({
      where: {
        assetId,
        appId: appId,
      },
    })

    const engine = await this.getEngine(appId)
    const ctx = await this.generateAppScopedEngineContext(appId)

    const { filePath, deleteFile: deleteLocalFileCopy } =
      await this.pullAssetFromRemote(assetId)

    const readStream = createReadStreamSafe(filePath)

    let hasSaveExternalAssetIdCallbackBeenCalled = false

    const saveExternalAssetId = async (externalId: string) => {
      hasSaveExternalAssetIdCallbackBeenCalled = true
      await this.saveExternalAssetId(assetOnApp.id, externalId)
    }
    await engine.attachAsset(ctx, readStream, saveExternalAssetId)

    await deleteLocalFileCopy()

    if (!hasSaveExternalAssetIdCallbackBeenCalled) {
      throw createHttpError(
        500,
        `saveExternalAssetId callback was not called on engine when attaching an asset. Engine: ${engine.getName()}`,
      )
    }
  }

  async removeAsset(appId: string, assetId: string) {
    const assetOnApp = await this.prisma.assetsOnApps.findFirstOrThrow({
      where: {
        assetId,
        appId,
      },
    })
    const externalId = assetOnApp.externalId

    if (!externalId) {
      throw createHttpError(500, 'External id is missing')
    }

    const ctx = await this.generateAppScopedEngineContext(appId)

    const engine = await this.getEngine(appId)
    await engine.removeAsset(ctx, externalId)
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

    const engine = this.getEngineByName('OpenaiAssistantsEngine')
    if (!engine) {
      throw createHttpError(
        500,
        'OpenaiAssistantsEngine has been accidentally deleted.',
      )
    }

    return engine
  }

  private getEngineByName(name: string) {
    const engine = this.engines.find((engine) => engine.getName() === name)
    if (!engine) {
      throw new Error(`Engine ${name} not found`)
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
    const ctx = await appEnginePayloadBuilder.buildForChat(chatId)

    await this.validateModelIsEnabledOrThrow(ctx.providerSlug, ctx.modelSlug)
    return ctx
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
