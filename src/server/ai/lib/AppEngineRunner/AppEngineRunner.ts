import { AppEngineType } from '@/components/apps/appsTypes'
import { getAppByIdService } from '@/server/apps/services/getAppById.service'
import { readAssetService } from '@/server/assets/services/readAsset.service'
import { type UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { getApplicableAppConfigToChatService } from '@/server/chats/services/getApplicableAppConfigToChat.service'
import { getChatByIdService } from '@/server/chats/services/getChatById.service'
import { saveTokenCountService } from '@/server/chats/services/saveTokenCount.service'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { errorLogger } from '@/shared/errors/errorLogger'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { PrismaClient } from '@prisma/client'
import fs from 'fs'
import createHttpError from 'http-errors'
import path from 'path'
import { aiProvidersFetcherService } from '../../services/aiProvidersFetcher.service'
import type { AbstractAppEngine, AppEngineParams } from '../AbstractAppEngine'
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
    let hoistedCtx: AppEngineParams<never> | undefined = undefined
    try {
      await this.validateUserHasPermissionsOrThrow(chatId)
      await this.maybeAttachAppConfigVersionToChat(chatId)

      const chat = await this.getChat(chatId)
      const ctx = await this.generateEngineRuntimeContext(chatId)
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
    console.log(3)
    await this.prisma.assetsOnApps.findFirstOrThrow({
      where: {
        assetId,
        appId: appId,
      },
    })
    console.log(4)
    const engine = await this.getEngine(appId)
    console.log(5, engine.getName())
    const { filePath, deleteFile } = await this.getAssetFromS3(assetId)
    console.log(6)
    const thing = createReadStreamSafe(filePath)
    console.log(7)
    await engine.attachAsset(thing)
    console.log(8)
  }

  private async getChat(chatId: string) {
    return await getChatByIdService(this.prisma, this.context, {
      chatId,
    })
  }

  private async getEngine(appId: string) {
    const app = await getAppByIdService(this.prisma, this.context, {
      appId,
    })

    // DANGER: DO NOT COMMIT THIS
    const engineType = app.engineType

    // if (engineType === AppEngineType.Default.toString()) {
    //   return this.getDefaultEngine()
    // }

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

  private async generateEngineRuntimeContext(chatId: string) {
    const appEnginePayloadBuilder = new AppEnginePayloadBuilder(
      this.prisma,
      this.context,
    )
    const ctx = await appEnginePayloadBuilder.call(chatId)

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

  private async getAssetFromS3(assetId: string) {
    return await readAssetService(this.prisma, this.context, {
      assetId,
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

function createReadStreamSafe(filePath: string) {
  // Define a base directory to prevent path traversal
  const baseDir = path.resolve(process.cwd(), 'tmp')
  console.log('filePath', filePath)
  // Resolve the full path
  const fullPath = path.resolve(baseDir, filePath)

  console.log(2221, fullPath)
  // Ensure the resolved path is within the base directory
  // if (!fullPath.startsWith(baseDir)) {
  //   throw new Error('Invalid file path')
  // }

  // Check if the file exists
  if (!fs.existsSync(fullPath)) {
    throw new Error('File does not exist')
  }

  // Create and return the read stream
  return fs.createReadStream(fullPath)
}
