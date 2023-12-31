import { Author } from '@/shared/aiTypesAndMappers'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import Promise from 'bluebird'
import { encode } from 'gpt-tokenizer'
import { chunk, isNull } from 'underscore'
import { getTokenCostInNanoCents } from '../chatUtils'

export const doTokenCountForChatRun = async (
  prisma: PrismaClientOrTrxClient,
  chatRunId: string,
) => {
  const chatRun = await prisma.chatRun.findUniqueOrThrow({
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

  let requestTokens = 0
  let responseTokens = 0
  const messagesLength = chatRun.chatRunMessages.length

  await Promise.mapSeries(
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
        count = message.tokens ?? (await chunkedCount(message.message))
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

  if (!chatRun.chat.postConfigVersion) {
    throw new Error('ChatRun should have a postConfigVersion')
  }
  const model = chatRun.chat.postConfigVersion.model

  const requestTokensCostInNanoCents =
    getTokenCostInNanoCents(requestTokens, 'request', 'openai', model) ?? 0
  const responseTokensCostInNanoCents =
    getTokenCostInNanoCents(responseTokens, 'response', 'openai', model) ?? 0

  return await prisma.chatRun.update({
    where: { id: chatRun.id },
    data: {
      requestTokens,
      responseTokens,
      requestTokensCostInNanoCents,
      responseTokensCostInNanoCents,
    },
  })
}

const chunkedCount = async (message: string | null) => {
  if (!message) return 0

  const chunked = chunk(message.split(' '), 200)
  return await Promise.reduce(
    chunked,
    async (acc, chunk) => {
      return new Promise((resolve, reject) => {
        try {
          setImmediate(() => {
            const tokens = encode(chunk.join(' ')).length
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
