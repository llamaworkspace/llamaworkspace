import { chatEditionFilter } from '@/components/chats/backend/chatsBackendUtils'
import { env } from '@/env.mjs'
import { authOptions } from '@/server/auth/nextauth'
import { prisma } from '@/server/db'
import type { AiRegistryMessage } from '@/server/lib/ai-registry/aiRegistryTypes'
import { withMiddlewareForAppRouter } from '@/server/middlewares/withMiddleware'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { getPostConfigForChatIdService } from '@/server/posts/services/getPostConfigForChatId.service'
import { Author } from '@/shared/aiTypesAndMappers'
import { errorLogger } from '@/shared/errors/errorLogger'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { Message } from '@prisma/client'
import { AssistantResponse } from 'ai'
import Promise from 'bluebird'
import createHttpError from 'http-errors'
import { getServerSession } from 'next-auth'
import OpenAI from 'openai'
import type { MessageCreateParams } from 'openai/resources/beta/threads/messages'
import { chain } from 'underscore'
import { handleChatTitleCreate } from './chatStreamedResponseHandlerUtils'

const ASSISTANT_ID = 'asst_38XDIcKNFjMDvp5p7tNoCq06'

interface BodyPayload {
  data: {
    chatId: string
  }
}

async function handler(req: Request) {
  let tokenResponse = ''
  let targetMessageId: string | undefined = undefined

  try {
    const { chatId } = await getParsedBody(req)
    console.log(111, chatId)
    const userId = await getRequestUserId()

    const [chat, postConfigVersion, messages] = await Promise.all([
      await getChat(chatId, userId),
      await getPostConfigVersionForChat(chatId, userId),
      await getParsedMessagesForChat(chatId, userId),
    ])

    const workspaceId = chat.post.workspaceId

    await validateUserPermissionsOrThrow(userId, chatId)

    const allUnprocessedMessages = [...postConfigVersion.messages, ...messages]

    const { messages: allMessages, targetMessage } = prepareMessagesForPrompt(
      allUnprocessedMessages,
    )

    targetMessageId = targetMessage.id

    if (!chat.postConfigVersionId) {
      await attachPostConfigVersionToChat(chatId, postConfigVersion.id)
    }

    // Todo: Update chatRun as transaction, in fact run everything as a trx!
    const chatRun = await createChatRun(
      chatId,
      allUnprocessedMessages.map((m) => m.id),
    )

    void handleChatTitleCreate(prisma, workspaceId, userId, chatId)

    // const onFinal = async (final: string) => {
    //   await updateMessage(assistantTargetMessage.id, final)
    //   await saveTokenCountForChatRunService(prisma, chatRun.id)
    // }

    // const onToken = (token: string) => {
    //   tokenResponse += token
    // }

    // const onError = async (error: Error) => {
    //   await deleteMessage(assistantTargetMessage.id)
    //   errorLogger(error)
    // }
    return await assistantsHandler(allMessages, targetMessage.id)

    // const provider = aiProvidersFetcherService.getProvider(providerSlug)

    // if (!provider) {
    //   throw new Error(`Provider ${providerSlug} not found`)
    // }

    // const stream = await provider.executeAsStream(
    //   {
    //     provider: providerSlug,
    //     model,
    //     messages: allMessages,
    //     onToken,
    //     onFinal,
    //   },
    //   providerKVs,
    // )

    // const headers = {
    //   'Content-Type': 'text/event-stream',
    // }
    // return new StreamingTextResponse(stream, { headers })
  } catch (_error) {
    const error = ensureError(_error)
    if (tokenResponse.length && targetMessageId) {
      await updateMessage(targetMessageId, tokenResponse)
    } else if (targetMessageId) {
      await deleteMessage(targetMessageId)
    }

    errorLogger(error)
    throw createHttpError(403, error.message)
  }
}

const validateUserPermissionsOrThrow = async (
  userId: string,
  chatId: string,
) => {
  const chat = await prisma.chat.findFirstOrThrow({
    where: {
      id: chatId,
      ...chatEditionFilter(userId),
    },
  })

  await new PermissionsVerifier(prisma).callOrThrowTrpcError(
    PermissionAction.Use,
    userId,
    chat.postId,
  )

  return true
}

const getChat = async (chatId: string, userId: string) => {
  return await prisma.chat.findFirstOrThrow({
    where: {
      id: chatId,
      ...chatEditionFilter(userId),
    },
    include: {
      post: {
        select: {
          workspaceId: true,
        },
      },
    },
  })
}

const getPostConfigVersionForChat = async (chatId: string, userId: string) => {
  return await getPostConfigForChatIdService(prisma, chatId, userId)
}

const attachPostConfigVersionToChat = async (
  chatId: string,
  postConfigVersionId: string,
) => {
  await prisma.chat.update({
    where: {
      id: chatId,
    },
    data: {
      postConfigVersionId,
    },
  })
}

const getParsedMessagesForChat = async (chatId: string, userId: string) => {
  return await prisma.message.findMany({
    where: {
      chatId,
      chat: {
        ...chatEditionFilter(userId),
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  })
}

const getRequestUserId = async () => {
  const session = await getServerSession(authOptions)

  if (!session) throw createHttpError(401, 'You must be logged in.')
  return session.user.id
}

const createChatRun = async (chatId: string, messageIds: string[]) => {
  return await prisma.chatRun.create({
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

const updateMessage = async (messageId: string, message: string) => {
  await prisma.message.update({
    where: {
      id: messageId,
    },
    data: {
      message,
    },
  })
}

const deleteMessage = async (messageId: string) => {
  await prisma.message.delete({
    where: {
      id: messageId,
    },
  })
}

interface PreparedMessagesForPrompt {
  messages: AiRegistryMessage[]
  targetMessage: Message
}

const prepareMessagesForPrompt = (
  messages: Message[],
): PreparedMessagesForPrompt => {
  if (messages.length < 2) {
    throw new Error('Message length should be at least 2')
  }

  // This last message should be maxCreatedAt where the author=assistant and should be empty
  // It shouldn't be sent over
  const targetMessage = chain(messages)
    .filter(
      (message) =>
        message.author === (Author.Assistant as string) &&
        message.message === null,
    )
    .max((message) => message.createdAt.getTime())
    .value() as Message

  const llmMessagesPayload = messages.filter((message) => {
    if (targetMessage.id === message.id) {
      return false
    }
    return message.message !== null && message.message !== ''
  })

  return {
    messages: llmMessagesPayload.map(transformMessageModelToPayload),
    targetMessage,
  }
}

const transformMessageModelToPayload = (
  message: Message,
): AiRegistryMessage => {
  if (!message.message) throw new Error('Message should have a message')

  return {
    role: message.author as Author,
    content: message.message,
  }
}

const getParsedBody = async (req: Request) => {
  const json = (await req.json()) as BodyPayload
  return json.data
}
// Utility function to ensure we're working with a proper Error object
const ensureError = (err: unknown): Error => {
  if (err instanceof Error) {
    return err
  }

  // If the thrown value isn't an Error but has an error-like structure
  if (typeof err === 'object' && err && 'message' in err) {
    return Object.assign(new Error((err as { message: string }).message), err)
  }

  // For other cases, such as when a string or number is thrown
  return new Error(String(err))
}

export const experimental_assistantStreamedResponseHandler =
  withMiddlewareForAppRouter(handler)

const assistantsHandler = async (
  aiRegistryMessages: AiRegistryMessage[],
  targetMessageId: string,
) => {
  const openai = new OpenAI({
    apiKey: env.INTERNAL_OPENAI_API_KEY,
  })
  const messages = aiRegistryMessages.filter(
    (message) => message.role !== 'system',
  ) as MessageCreateParams[]

  const thread = await openai.beta.threads.create({
    messages,
  })
  const threadId = thread.id

  return AssistantResponse(
    {
      threadId,
      messageId: targetMessageId,
    },
    async ({ forwardStream, sendDataMessage }) => {
      const runStream = openai.beta.threads.runs.stream(threadId, {
        assistant_id: ASSISTANT_ID,
      })

      // sendDataMessage({
      //   role: 'data',
      //   data: {
      //     lorem: 'Ipsum gromenauer',
      //   },
      // })

      // forward run status would stream message deltas
      const runResult = await forwardStream(runStream)

      // status can be: queued, in_progress, requires_action, cancelling, cancelled, failed, completed, or expired

      // while (runResult?.status === 'requires_action') {
      //   console.log('runResult', runResult)
      // }
    },
  )
}
