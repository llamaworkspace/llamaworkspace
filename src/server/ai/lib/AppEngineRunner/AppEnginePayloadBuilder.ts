import { Author } from '@/shared/aiTypesAndMappers'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import type { Message } from '@prisma/client'
import { chain } from 'underscore'
import type { AppEngineParams } from '../AbstractAppEngine'

export class AppEnginePayloadBuilder {
  constructor(private readonly prisma: PrismaClientOrTrxClient) {}

  async call(chatId: string): Promise<AppEngineParams<Record<string, never>>> {
    const messages = await this.buildMessages(chatId)
    return {
      messages,
    }
  }

  private async buildMessages(chatId: string) {
    const messages = await this.getMessagesForChat(chatId)
    return this.prepareMessagesForPrompt(messages)
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
}
