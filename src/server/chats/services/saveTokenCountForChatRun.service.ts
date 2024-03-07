import { getProviderAndModelFromFullSlug } from '@/server/ai/aiUtils'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { Author } from '@/shared/aiTypesAndMappers'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'
import type { ChatRun } from '@prisma/client'
import BBPromise from 'bluebird'
import { encode as gptTokenizer } from 'gpt-tokenizer'
import { chunk, isNull, omit } from 'underscore'

export const saveTokenCountForChatRunService = async (
  prisma: PrismaClientOrTrxClient,
  chatRunId: string,
): Promise<ChatRun> => {
  return await prismaAsTrx(prisma, async (prisma) => {
    const chatRun = await getChatRunWithExtras(prisma, chatRunId)

    if (!chatRun.chat.postConfigVersion) {
      throw new Error('ChatRun should have a postConfigVersion')
    }

    const fullModelSlug = chatRun.chat.postConfigVersion.model

    const { provider: providerSlug } =
      getProviderAndModelFromFullSlug(fullModelSlug)

    switch (providerSlug) {
      case 'openai':
      case 'anthropic':
        return await saveTokenCountForOpenaiProvider(prisma, chatRun)
    }

    return omit(chatRun, 'chat', 'chatRunMessages')
  })
}

const chunkedCountForGptTokenizer = async (message: string | null) => {
  if (!message) return 0

  const chunked = chunk(message.split(' '), 200)
  return await BBPromise.reduce(
    chunked,
    async (acc, chunk) => {
      return new Promise((resolve, reject) => {
        try {
          setImmediate(() => {
            const tokens = gptTokenizer(chunk.join(' ')).length
            setImmediate(() => {
              resolve(acc + tokens)
            })
          })
        } catch (error) {
          reject(error)
        }
      })
    },
    0,
  )
}

const getChatRunWithExtras = async (
  prisma: PrismaTrxClient,
  chatRunId: string,
) => {
  return await prisma.chatRun.findUniqueOrThrow({
    where: {
      id: chatRunId,
    },
    include: {
      chat: {
        include: {
          postConfigVersion: true,
        },
      },
      chatRunMessages: {
        include: {
          message: true,
        },
      },
    },
  })
}

type ChatRunWithExtras = Awaited<ReturnType<typeof getChatRunWithExtras>>

const saveTokenCountForOpenaiProvider = async (
  prisma: PrismaTrxClient,
  chatRun: ChatRunWithExtras,
) => {
  let requestTokens = 0
  let responseTokens = 0
  const messagesLength = chatRun.chatRunMessages.length

  await BBPromise.mapSeries(
    chatRun.chatRunMessages,
    async (chatRunMessage, index) => {
      const message = chatRunMessage.message
      let count: number
      if (
        isNull(message.message) &&
        message.author !== (Author.System as string)
      ) {
        count = 0
      } else {
        count =
          message.tokens ?? (await chunkedCountForGptTokenizer(message.message))
      }

      if (isNull(message.tokens)) {
        await prisma.message.update({
          where: { id: message.id },
          data: {
            tokens: count,
          },
        })
      }

      if (index + 1 === messagesLength) {
        responseTokens += count
      } else {
        requestTokens += count
      }
    },
  )

  return await prisma.chatRun.update({
    where: { id: chatRun.id },
    data: {
      requestTokens,
      responseTokens,
    },
  })
}
