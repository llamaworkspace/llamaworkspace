import { getAppKeyValuesService } from '@/server/apps/services/getAppKeyValues.service'
import { upsertAppKeyValuesService } from '@/server/apps/services/upsertAppKeyValues.service'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { getApplicableAppConfigToChatService } from '@/server/chats/services/getApplicableAppConfigToChat.service'
import { getChatByIdService } from '@/server/chats/services/getChatById.service'
import { getMessagesByChatIdService } from '@/server/chats/services/getMessagesByChatId.service'
import { Author } from '@/shared/aiTypesAndMappers'
import type {
  PrismaClientOrTrxClient,
  SimplePrimitive,
} from '@/shared/globalTypes'
import type { Message } from '@prisma/client'
import { Promise } from 'bluebird'
import createHttpError from 'http-errors'
import { chain, isNumber } from 'underscore'
import { getProviderAndModelFromFullSlug } from '../../aiUtils'
import {
  getAiProviderKVsService,
  getAllAiProvidersKVsService,
} from '../../services/getProvidersForWorkspace.service'
import type {
  AppEngineConfigParams,
  AppEngineRunParams,
  EngineAppKeyValues,
} from '../AbstractAppEngine'

export class AppEnginePayloadBuilder {
  constructor(
    private readonly prisma: PrismaClientOrTrxClient,
    private readonly context: UserOnWorkspaceContext,
  ) {}

  async buildForChat(
    chatId: string,
  ): Promise<AppEngineRunParams<EngineAppKeyValues, Record<string, string>>> {
    const [
      chat,
      appConfigVersion,
      { rawMessages, preparedMessages },
      targetAssistantRawMessage,
    ] = await Promise.all([
      await this.getChat(chatId),
      await this.getAppConfigVersionForChat(chatId),
      await this.buildMessages(chatId),
      await this.getTargetAssistantMessage(chatId),
    ])

    const model = getProviderAndModelFromFullSlug(appConfigVersion.model)
    const appKeyValuesStore = this.getKeyValuesStore(chat.appId)

    const providerKVs = await this.getProviderKVs(model.provider)

    if (appConfigVersion.systemMessage) {
      const systemMessage = appConfigVersion.messages.find(
        (message) => message.author === Author.System.toString(),
      )

      if (!systemMessage) {
        throw new Error('System message not found')
      }

      rawMessages.unshift(systemMessage)
      preparedMessages.unshift({
        role: Author.System,
        content: appConfigVersion.systemMessage,
      })
    }

    return {
      appId: chat.appId,
      chatId,
      targetAssistantRawMessage,
      rawMessages,
      messages: preparedMessages,
      fullSlug: appConfigVersion.model,
      modelSlug: model.model,
      providerSlug: model.provider,
      providerKVs,
      appKeyValuesStore,
    }
  }

  async buildForApp(
    appId: string,
  ): Promise<AppEngineConfigParams<EngineAppKeyValues>> {
    const aiProviders = await getAllAiProvidersKVsService(
      this.prisma,
      this.context,
    )
    const appKeyValuesStore = this.getKeyValuesStore(appId)

    return {
      appId,
      aiProviders,
      appKeyValuesStore,
    }
  }

  private async getChat(chatId: string) {
    return await getChatByIdService(this.prisma, this.context, { chatId })
  }

  private async buildMessages(chatId: string) {
    const messages = await this.getMessagesForChat(chatId)

    return {
      rawMessages: messages,
      preparedMessages: this.prepareMessagesForPrompt(messages),
    }
  }

  private async getAppConfigVersionForChat(chatId: string) {
    return await getApplicableAppConfigToChatService(
      this.prisma,
      this.context,
      {
        chatId,
      },
    )
  }

  private async getMessagesForChat(chatId: string) {
    return await getMessagesByChatIdService(this.prisma, this.context, {
      chatId,
    })
  }

  private async getTargetAssistantMessage(chatId: string) {
    const messages = await getMessagesByChatIdService(
      this.prisma,
      this.context,
      {
        chatId,
      },
    )

    const message = chain(messages)
      .filter((message) => message.author === Author.Assistant.toString())
      .max((message) => message.createdAt.getTime())
      .value()

    // If there is no assistant message, it'll be -Infinity (ie a number)
    if (isNumber(message)) {
      throw createHttpError(500, 'At least one assistant Message should exist')
    }
    return message
  }

  private async getProviderKVs(providerSlug: string) {
    return await getAiProviderKVsService(
      this.prisma,
      this.context,
      providerSlug,
    )
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

  private getKeyValuesStore(appId: string) {
    return {
      getAll: async () => {
        const res = await getAppKeyValuesService(this.prisma, this.context, {
          appId,
        })

        return res.data
      },

      set: async (key: string, value: SimplePrimitive) => {
        const keyValuePairs = {
          [key]: value,
        }
        return await upsertAppKeyValuesService(this.prisma, this.context, {
          appId,
          keyValuePairs,
        })
      },
    }
  }
}
