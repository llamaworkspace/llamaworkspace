import { env } from '@/env.mjs'
import { addTransactionRepo } from '@/server/transactions/repositories/addTransactionRepo'
import { TrxAccount } from '@/server/transactions/transactionTypes'
import { ChatAuthor, OpenAiModelEnum } from '@/shared/aiTypesAndMappers'
import type { PrismaClient } from '@prisma/client'
import OpenAI, { ClientOptions } from 'openai'
import { getTokenCostInNanoCents } from '../../chatUtils'

export const registerTransaction = async (
  prisma: PrismaClient,
  workspaceId: string,
  chargeableUserId: string,
  chatRunId: string,
  costInNanoCents: number,
) => {
  await addTransactionRepo(prisma, {
    workspaceId,
    userId: chargeableUserId,
    from: {
      account: TrxAccount.WorkspaceBalance,
      amountInNanoCents: costInNanoCents,
    },
    to: {
      account: TrxAccount.UserCreditsUse,
      amountInNanoCents: costInNanoCents,
    },
    description: `chatRunId ${chatRunId}`,
  })
}

export const handleChatTitleCreate = async (
  prisma: PrismaClient,
  workspaceId: string,
  chargeableUserId: string,
  chatId: string,
) => {
  const data = await prisma.chat.findFirstOrThrow({
    where: {
      id: chatId,
    },
    include: {
      messages: true,
      post: {
        select: {
          title: true,
        },
      },
      postConfigVersion: {
        include: {
          messages: true,
        },
      },
    },
  })
  if (data.title) return

  const systemMessage = data.postConfigVersion?.messages[0]
  const userMessages = data.messages.filter(
    (message) => message.author === (ChatAuthor.User as string),
  )
  // Todo: improve and search in case there are multiple user messages
  const firstUserMessage = userMessages[0]

  const openAiPayload: ClientOptions = {
    apiKey: env.OPENAI_API_KEY,
  }

  if (env.OPTIONAL_OPENAI_BASE_URL) {
    openAiPayload.baseURL = env.OPTIONAL_OPENAI_BASE_URL
  }

  const openai = new OpenAI(openAiPayload)

  let content = data.post.title ? `MAIN TITLE: ${data.post.title}. ` : ''
  const instructions = systemMessage?.message?.slice(0, 500)

  const request = firstUserMessage?.message?.slice(0, 500)

  content += instructions && `INSTRUCTIONS: ${instructions}. `
  content += request && `REQUEST: ${request}. `

  const messages = [
    { role: 'system' as OpenAI.Chat.ChatCompletionRole, content: TITLE_PROMPT },
    { role: 'user' as OpenAI.Chat.ChatCompletionRole, content },
  ]

  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    messages,
    model: OpenAiModelEnum.GPT4,
    temperature: 0.2,
  }

  const aiResponse = await openai.chat.completions.create(params)
  const message = aiResponse.choices[0]?.message
  if (!message) return
  const finalTitle = message.content?.replaceAll(`"`, ``)

  let costInNanoCents = 0
  if (aiResponse.usage) {
    const requestCost = getTokenCostInNanoCents(
      aiResponse.usage.prompt_tokens,
      'request',
      OpenAiModelEnum.GPT4,
    )

    const responseCost = getTokenCostInNanoCents(
      aiResponse.usage.completion_tokens,
      'response',
      OpenAiModelEnum.GPT4,
    )
    costInNanoCents = requestCost + responseCost
  }

  await addTransactionRepo(prisma, {
    workspaceId,
    userId: chargeableUserId,
    from: {
      account: TrxAccount.WorkspaceBalance,
      amountInNanoCents: costInNanoCents,
    },
    to: {
      account: TrxAccount.UserCreditsUse,
      amountInNanoCents: costInNanoCents,
    },
    description: `Title for chatId ${chatId}`,
  })

  if (content) {
    await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        title: finalTitle,
      },
    })
  }
}
const TITLE_PROMPT = `You are a title creator for a document. The document is part of series of similar docs about a topic or question. The title must make it easy to differentiate between different documents of the same topic. 

You'll be given the following inputs:
- Main title: Title of the topic.
- Instructions: Generic context about the topic. They are usually a set of requests that a machine must follow.
- Request: First sentences of a user requesting more information about the topic, which must be responded according to the Instructions.
- Other titles: Titles already used that you should avoid repeating.

If some of the inputs are not sent, then ignore them.

If the Main title already gives some context, avoid giving it again. For example: "Joia's fun facts teller"; avoid a title like this "Fun Facts about the City of Lights" and return something this instead: "City of lights". Essentially, try to avoid repeating words from the title.

Try to make the title less than 35 letters. Respond with just one title. Do not provide anything else different than the title.`
