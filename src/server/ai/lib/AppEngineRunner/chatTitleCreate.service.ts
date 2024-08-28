import { getProviderAndModelFromFullSlug } from '@/server/ai/aiUtils'
import { getAiProviderKVsService } from '@/server/ai/services/getProvidersForWorkspace.service'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { ChatAuthor, OpenAiModelEnum } from '@/shared/aiTypesAndMappers'
import type { PrismaClient } from '@prisma/client'
import { HttpError } from 'http-errors'
import OpenAI, { type ClientOptions } from 'openai'

interface ChatTitleCreatePayload {
  chatId: string
}

export const chatTitleCreateService = async (
  prisma: PrismaClient,
  uowContext: UserOnWorkspaceContext,
  { chatId }: ChatTitleCreatePayload,
) => {
  const { userId, workspaceId } = uowContext
  const chat = await getChat(prisma, chatId)
  if (chat.title) return

  const systemMessage = chat.appConfigVersion?.messages[0]
  const userMessages = chat.messages.filter(
    (message) => message.author === (ChatAuthor.User as string),
  )

  const firstUserMessage = userMessages[0]

  let openaiProviderKVs: ClientOptions
  try {
    openaiProviderKVs = await getAiProviderKVsService(
      prisma,
      uowContext,
      'openai',
    )
  } catch (error) {
    if (error instanceof HttpError && error.statusCode === 403) {
      return
    }
    throw error
  }

  const openai = new OpenAI(openaiProviderKVs)

  let content = chat.app.title ? `MAIN TITLE: ${chat.app.title}. ` : ''
  const instructions = systemMessage?.message?.slice(0, 500)

  const request = firstUserMessage?.message?.slice(0, 500)

  content += instructions && `INSTRUCTIONS: ${instructions}. `
  content += request && `REQUEST: ${request}. `

  const { model } = getProviderAndModelFromFullSlug(OpenAiModelEnum.GPT4)

  const params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
    messages: [
      {
        role: 'system',
        content: TITLE_PROMPT,
        name: 'system',
      },
      { role: 'user', content, name: 'user' },
    ],
    model,
    temperature: 0.2,
  }

  const aiResponse = await openai.chat.completions.create(params)

  const message = aiResponse.choices[0]?.message

  if (!message) return
  const finalTitle = message.content?.replaceAll(`"`, ``)

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

If the Main title already gives some context, avoid giving it again. For example: "Llama Workspace's fun facts teller"; avoid a title like this "Fun Facts about the City of Lights" and return something this instead: "City of lights". Essentially, try to avoid repeating words from the title.

Try to make the title less than 35 letters. Respond with just one title. Do not provide anything else different than the title.`

const getChat = async (prisma: PrismaClient, chatId: string) => {
  return await prisma.chat.findFirstOrThrow({
    where: {
      id: chatId,
    },
    include: {
      messages: true,
      app: {
        select: {
          title: true,
        },
      },
      appConfigVersion: {
        include: {
          messages: true,
        },
      },
    },
  })
}
