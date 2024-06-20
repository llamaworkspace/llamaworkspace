import { type UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { getMessagesByChatIdService } from '@/server/chats/services/getMessagesByChatId.service'
import { saveTokenCountForChatRunService } from '@/server/chats/services/saveTokenCountForChatRun.service'
import { Author } from '@/shared/aiTypesAndMappers'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import type { Message } from '@prisma/client'
import { StreamingTextResponse } from 'ai'
import { chain } from 'underscore'
import { DefaultAppEngineV2 } from '../DefaultAppEngineV2'
import { AppEnginePayloadBuilder } from './AppEnginePayloadBuilder'

export class AppEngineRunner {
  constructor(
    private readonly prisma: PrismaClientOrTrxClient,
    private readonly context: UserOnWorkspaceContext,
    // private readonly engines: AbstractAppEngineV2[],
  ) {}

  async call(chatId: string): Promise<StreamingTextResponse> {
    const ctx = await this.generateEngineRuntimeContext(chatId)

    const targetAssistantMessage = await this.getTargetAssistantMessage(chatId)
    const rawMessageIds = ctx.rawMessages.map((message) => message.id)
    const chatRun = await this.createChatRun(chatId, rawMessageIds)
    const callbacks = this.getCallbacks(targetAssistantMessage.id, chatRun.id)
    return new DefaultAppEngineV2().run(ctx, callbacks)
  }

  // async _call(chatId: string): Promise<ReadableStream<unknown>> {
  //   const engineType = await this.getEngineType(this.context, chatId)

  //   if (!engineType) {
  //     throw createHttpError(500, 'engineType is not yet set')
  //   }

  //   if (engineType !== AppEngineType.Default.toString()) {
  //     throw createHttpError(500, 'non-default engineType is not yet supported')
  //   }

  //   const targetAssistantMessage = await this.getTargetAssistantMessage(chatId)

  //   // const engine = this.getDefaultEngine()
  //   const ctx = await this.generateEngineRuntimeContext(this.context, chatId)

  //   return await engine.run(ctx, this.getCallbacks(targetAssistantMessage.id))
  // }

  // private getDefaultEngine() {
  //   const engine = this.engines.find(
  //     (engine) => engine.getName() === AppEngineType.Default.toString(),
  //   )
  //   if (!engine) {
  //     throw createHttpError(500, `Default engine not found`)
  //   }
  //   return engine
  // }

  // private async getEngineType(
  //   uowContext: UserOnWorkspaceContext,
  //   chatId: string,
  // ) {
  //   const chat = await getChatByIdService(this.prisma, uowContext, {
  //     chatId,
  //     includeApp: true,
  //   })

  //   return chat.app.engineType
  // }

  private async getTargetAssistantMessage(chatId: string) {
    const messages = await getMessagesByChatIdService(
      this.prisma,
      this.context,
      {
        chatId,
      },
    )
    return chain(messages)
      .filter((message) => message.author === Author.Assistant.toString())
      .max((message) => message.createdAt.getTime())
      .value() as Message
  }

  private async generateEngineRuntimeContext(chatId: string) {
    const appEnginePayloadBuilder = new AppEnginePayloadBuilder(
      this.prisma,
      this.context,
    )
    return await appEnginePayloadBuilder.call(chatId)
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

  private getCallbacks(targetAssistantMessageId: string, chatRunId: string) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onToken: () => {},
      onError: async (error: Error, partialResult: string) => {
        if (partialResult) {
          await this.saveMessage(targetAssistantMessageId, partialResult)
        }
        await this.deleteMessage(targetAssistantMessageId)
        // throw error // TODO: This error is silently swallowed
      },
      onFinal: async (fullMessage: string) => {
        await this.saveMessage(targetAssistantMessageId, fullMessage)
        await saveTokenCountForChatRunService(this.prisma, chatRunId)
      },
    }
  }
}
