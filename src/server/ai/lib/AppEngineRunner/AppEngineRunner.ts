import { AppEngineType } from '@/components/apps/appsTypes'
import { Author } from '@/shared/aiTypesAndMappers'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import type { Message } from '@prisma/client'
import createHttpError from 'http-errors'
import { chain } from 'underscore'
import type { AbstractAppEngine } from '../AbstractAppEngine'

export class AppEngineRunner {
  constructor(
    private readonly prisma: PrismaClientOrTrxClient,
    private readonly engines: AbstractAppEngine[],
  ) {}

  async call(userId: string, chatId: string) {
    const engineType = await this.getEngineType(chatId)

    if (!engineType) {
      throw createHttpError(500, 'engineType is not yet set')
    }

    if (engineType !== AppEngineType.Default.toString()) {
      throw createHttpError(500, 'non-default engineType is not yet supported')
    }

    const ctx = await this.generateEngineRuntimeContext(userId, chatId)
    const messages = await this.generateEngineMessages(chatId)

    const engine = this.getDefaultEngine()
    return await engine.run({ ctx, messages })
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

  private async getEngineType(chatId: string) {
    const chat = await this.prisma.chat.findUniqueOrThrow({
      where: {
        id: chatId,
      },
      include: {
        app: true,
      },
    })

    return chat.app.engineType
  }

  private async generateEngineRuntimeContext(userId: string, chatId: string) {
    // const model = await this.getModelPayload()

    const { app, ...chat } = await this.prisma.chat.findUniqueOrThrow({
      where: {
        id: chatId,
      },
      include: {
        app: true,
      },
    })

    return {
      // model,
      chat,
      app,
      kvs: {},
    }
  }

  private async generateEngineMessages(chatId: string) {
    const messages = await this.getMessagesForChat(chatId)
    return this.prepareMessagesForPrompt(messages)
  }

  private prepareMessagesForPrompt(messages: Message[]) {
    if (messages.length < 2) {
      throw new Error('Message length should be at least 2')
    }

    // This last message should be maxCreatedAt where the author=assistant and should be empty
    // It shouldn't be sent over
    const assistantTargetMessage = chain(messages)
      .filter(
        (message) =>
          message.author === (Author.Assistant as string) &&
          message.message === null,
      )
      .max((message) => message.createdAt.getTime())
      .value() as Message

    const llmMessagesPayload = messages.filter((message) => {
      if (assistantTargetMessage.id === message.id) {
        return false
      }
      return message.message !== null && message.message !== ''
    })

    return llmMessagesPayload.map((message: Message) => {
      if (!message.message) throw new Error('Message should have a message')

      return {
        role: message.author as Author,
        content: message.message,
      }
    })
  }

  private async getMessagesForChat(chatId: string) {
    return await this.prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
  }

  private async getModelPayload() {
    // const { provider: providerSlug, model } = getProviderAndModelFromFullSlug(
    //   appConfigVersion.model,
    // )
    // const providerKVs = await getAiProviderKVsService(
    //   this.prisma,
    //   workspaceId,
    //   userId,
    //   providerSlug,
    // )
    // return {
    //   providerSlug: 'xx',
    //   model: 'xx',
    //   providerKVs: {},
    // }
  }
}
