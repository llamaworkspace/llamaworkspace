import { AppEngineType } from '@/components/apps/appsTypes'
import { type UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { getChatByIdService } from '@/server/chats/services/getChatById.service'
import { getMessagesByChatIdService } from '@/server/chats/services/getMessagesByChatId.service'
import { Author } from '@/shared/aiTypesAndMappers'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { Message } from '@prisma/client'
import createHttpError from 'http-errors'
import { chain } from 'underscore'
import type { AbstractAppEngine } from '../AbstractAppEngine'
import { AppEnginePayloadBuilder } from './AppEnginePayloadBuilder'

export class AppEngineRunner {
  constructor(
    private readonly prisma: PrismaClientOrTrxClient,
    private readonly engines: AbstractAppEngine[],
    private readonly context: UserOnWorkspaceContext,
  ) {}

  async call(chatId: string): Promise<ReadableStream<unknown>> {
    const engineType = await this.getEngineType(this.context, chatId)

    if (!engineType) {
      throw createHttpError(500, 'engineType is not yet set')
    }

    if (engineType !== AppEngineType.Default.toString()) {
      throw createHttpError(500, 'non-default engineType is not yet supported')
    }

    const targetAssistantMessage = await this.getTargetAssistantMessage(chatId)

    const engine = this.getDefaultEngine()
    const ctx = await this.generateEngineRuntimeContext(this.context, chatId)

    return await engine.run(ctx, this.getCallbacks(targetAssistantMessage.id))
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

  private async getEngineType(
    uowContext: UserOnWorkspaceContext,
    chatId: string,
  ) {
    const chat = await getChatByIdService(this.prisma, uowContext, {
      chatId,
      includeApp: true,
    })

    return chat.app.engineType
  }

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

  private async generateEngineRuntimeContext(
    uowContext: UserOnWorkspaceContext,
    chatId: string,
  ) {
    const appEnginePayloadBuilder = new AppEnginePayloadBuilder(
      this.prisma,
      uowContext,
    )
    return await appEnginePayloadBuilder.call(chatId)
  }

  private async onEnd() {
    // await this.prisma.message
    console.log('onEnd')
  }

  private getCallbacks(targetAssistantMessageId: string) {
    return {
      onToken: (token?: string) => {
        console.log(111, token)
      },
      onError: (error: Error) => {
        console.log(222, error)
      },
      onEnd: async (fullMessage: string) => {
        console.log(333, fullMessage)
        await this.prisma.message.update({
          where: {
            id: targetAssistantMessageId,
          },
          data: {
            message: fullMessage,
          },
        })
      },
    }
  }
}
