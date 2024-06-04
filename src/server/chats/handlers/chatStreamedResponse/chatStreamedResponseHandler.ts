import { env } from '@/env.mjs'
import { ensureError } from '@/lib/utils'
import { getProviderAndModelFromFullSlug } from '@/server/ai/aiUtils'
import { CustomAssistantResponse } from '@/server/ai/lib/CustomAssistantResponse'
import { aiProvidersFetcherService } from '@/server/ai/services/aiProvidersFetcher.service'
import { getAiProviderKVsService } from '@/server/ai/services/getProvidersForWorkspace.service'
import { authOptions } from '@/server/auth/nextauth'
import {
  createUserOnWorkspaceContext,
  type UserOnWorkspaceContext,
} from '@/server/auth/userOnWorkspaceContext'
import { getApplicableAppConfigToChatService } from '@/server/chats/services/getApplicableAppConfigToChat.service'
import { prisma } from '@/server/db'
import type { AiRegistryMessage } from '@/server/lib/ai-registry/aiRegistryTypes'
import { withMiddlewareForAppRouter } from '@/server/middlewares/withMiddleware'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { Author } from '@/shared/aiTypesAndMappers'
import { errorLogger } from '@/shared/errors/errorLogger'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { createOpenAI } from '@ai-sdk/openai'
import type { Message } from '@prisma/client'
import { streamText } from 'ai'
import Promise from 'bluebird'
import createHttpError from 'http-errors'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { chain } from 'underscore'
import { z } from 'zod'
import { saveTokenCountForChatRunService } from '../../services/saveTokenCountForChatRun.service'
import { handleChatTitleCreate } from './chatStreamedResponseHandlerUtils'

interface VoidIncomingMessage {
  role: string
  content: string
}

const zBody = z.object({
  threadId: z.null(),
  message: z.literal(''),
  data: z.object({
    chatId: z.string(),
  }),
})

type RequestBody = z.infer<typeof zBody>

interface Thing {
  value: Uint8Array
  done: boolean
}
async function handler(req: NextRequest) {
  let tokenResponse = ''
  let assistantTargetMessageId: string | undefined = undefined

  try {
    const {
      data: { chatId },
    } = await getParsedBody(req)
    const userId = await getRequestUserId()
    const chat = await getChat(chatId)
    await validateUserPermissionsOrThrow(userId, chatId)
    const workspaceId = chat.app.workspaceId

    const context = await createUserOnWorkspaceContext(
      prisma,
      workspaceId,
      userId,
    )

    const [appConfigVersion, messages] = await Promise.all([
      await getAppConfigVersionForChat(context, chatId),
      await getParsedMessagesForChat(chatId),
    ])

    await validateModelIsEnabledOrThrow(
      workspaceId,
      userId,
      appConfigVersion.model,
    )

    const allUnprocessedMessages = [...appConfigVersion.messages, ...messages]

    const {
      messages: allMessages,
      assistantTargetMessage: assistantTargetMessage,
    } = prepareMessagesForPrompt(allUnprocessedMessages)

    assistantTargetMessageId = assistantTargetMessage.id

    if (!chat.appConfigVersionId) {
      await attachAppConfigVersionToChat(chatId, appConfigVersion.id)
    }

    // Todo: Update chatRun as transaction, in fact run everything as a trx!
    const chatRun = await createChatRun(
      chatId,
      allUnprocessedMessages.map((m) => m.id),
    )

    void handleChatTitleCreate(prisma, workspaceId, userId, chatId)

    // Method to extract provider from model
    const { provider: providerSlug, model } = getProviderAndModelFromFullSlug(
      appConfigVersion.model,
    )

    const providerKVs = await getAiProviderKVsService(
      prisma,
      workspaceId,
      userId,
      providerSlug,
    )

    const onFinal = async (final: string) => {
      await updateMessage(assistantTargetMessage.id, final)
      await saveTokenCountForChatRunService(prisma, chatRun.id)
    }

    const onToken = (token: string) => {
      tokenResponse += token
    }

    const onError = async (error: Error) => {
      await deleteMessage(assistantTargetMessage.id)
      errorLogger(error)
    }

    const provider = aiProvidersFetcherService.getProvider(providerSlug)

    if (!provider) {
      throw new Error(`Provider ${providerSlug} not found`)
    }

    // const openai = new OpenAI({
    //   // This needs to be provided at runtime
    //   apiKey: env.INTERNAL_OPENAI_API_KEY,
    // })

    const openai = createOpenAI({
      apiKey: env.INTERNAL_OPENAI_API_KEY,
    })

    // const aiResponse = await openai.chat.completions.create({
    //   model: payload.model,
    //   messages: payload.messages,
    //   stream: true,
    //   max_tokens: 4,
    // })

    // const finalStream2 = CustomAssistantResponse(
    //   {
    //     threadId: '124',
    //     messageId: '12346',
    //   },
    //   {
    //     onToken,
    //     onFinal: (run) => void onFinal(run),
    //   },

    //   async ({ sendTextMessage, forwardStream }) => {
    //     const thread = await openai.beta.threads.create({})
    //     const threadId = thread.id
    //     await openai.beta.threads.messages.create(threadId, {
    //       role: 'user',
    //       content: 'Say "soy juan el del Assistant hoohoho"',
    //     })
    //     const runStream = openai.beta.threads.runs.stream(threadId, {
    //       assistant_id: 'asst_sk18bpznVq02EKXulK5S3X8L',
    //     })

    //     // forward run status would stream message deltas
    //     const runResult = await forwardStream(runStream)
    //     // runResult.status can be: queued, in_progress, requires_action, cancelling, cancelled, failed, completed, or expired

    //     if (!runResult) {
    //       throw new Error('Run result is undefined')
    //     }

    //     while (runResult.status === 'requires_action') {}

    //     // if (['completed', 'cancelled'].includes(runResult.status)) {
    //     //   onFinal(runResult)
    //     // }

    //     if (runResult.status === 'failed') {
    //       const error = createHttpError(403, 'Run failed')
    //       error.payload = runResult
    //       // onError(error)
    //     }
    //   },
    // )

    // ........................
    const finalStream = CustomAssistantResponse(
      {
        threadId: '1',
        messageId: '1',
      },
      { onToken: () => {}, onFinal: () => {} },
      async ({ sendMessage, sendTextMessage }) => {
        const { textStream } = await streamText({
          model: openai('gpt-4o'),
          prompt: 'Invent a new holiday and describe its traditions.',
          maxTokens: 4,
        })

        for await (const textPart of textStream) {
          sendTextMessage(textPart)
        }
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
        // const reader = stream.getReader()
        // for await (const message of streamAsAsyncIterable) {
        //   if (message.event === 'thread.message.delta') {
        //     sendMessage({
        //       id: '123',
        //       role: 'assistant',
        //       content: message.data.delta.content?.map((content) => {
        //         const _content =
        //           content as OpenAI.Beta.Threads.Messages.TextDeltaBlock
        //         console.log('message', _content.text?.value)
        //         return {
        //           type: content.type,
        //           text: { value: _content.text?.value },
        //         }
        //       }),
        //     })
        //   }
        //   console.log('message', message)
        //   // sendTextMessage(message)
        // }

        // while (true) {
        //   const { value, done } = await reader.read()
        //   if (done) {
        //     break
        //   }
        //   const chunkText = new TextDecoder().decode(value).replace('0:', '')
        //   console.log(22, chunkText)
        //   sendTextMessage(chunkText)
        // }
      },
    )
    const headers = {
      'Content-Type': 'text/plain; charset=utf-8',
    }
    return new NextResponse(finalStream, { headers })
  } catch (_error) {
    const error = ensureError(_error)
    if (tokenResponse.length && assistantTargetMessageId) {
      await updateMessage(assistantTargetMessageId, tokenResponse)
    } else if (assistantTargetMessageId) {
      await deleteMessage(assistantTargetMessageId)
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
    },
    include: {
      app: true,
    },
  })

  await new PermissionsVerifier(prisma).passOrThrowTrpcError(
    PermissionAction.Use,
    userId,
    chat.appId,
  )

  return true
}

const validateModelIsEnabledOrThrow = async (
  workspaceId: string,
  userId: string,
  fullSlug: string,
) => {
  const providersMeta = await aiProvidersFetcherService.getFullAiProvidersMeta(
    workspaceId,
    userId,
  )
  const { provider: providerName, model: modelName } =
    getProviderAndModelFromFullSlug(fullSlug)
  const provider = providersMeta.find(
    (providerMeta) => providerMeta.slug === providerName,
  )
  if (!provider) throw new Error('Provider not found')
  const targetModel = provider.models.find((model) => model.slug === modelName)

  if (!targetModel) {
    throw createHttpError(
      403,
      `The model ${fullSlug} no longer exists. Please select another one.`,
    )
  }

  if (!targetModel.isEnabled) {
    throw createHttpError(
      403,
      `The model "${targetModel.fullPublicName}" is currently not enabled. Please select another one.`,
    )
  }

  if (!targetModel.isSetupOk) {
    throw createHttpError(
      403,
      `The model "${targetModel.fullPublicName}" is not setup correctly. Please select another one.`,
    )
  }

  return true
}

const getChat = async (chatId: string) => {
  return await prisma.chat.findFirstOrThrow({
    where: {
      id: chatId,
    },
    include: {
      app: {
        select: {
          workspaceId: true,
        },
      },
    },
  })
}

const getAppConfigVersionForChat = async (
  uowContext: UserOnWorkspaceContext,
  chatId: string,
) => {
  return await getApplicableAppConfigToChatService(prisma, uowContext, {
    chatId,
  })
}

const attachAppConfigVersionToChat = async (
  chatId: string,
  appConfigVersionId: string,
) => {
  await prisma.chat.update({
    where: {
      id: chatId,
    },
    data: {
      appConfigVersionId,
    },
  })
}

const getParsedMessagesForChat = async (chatId: string) => {
  return await prisma.message.findMany({
    where: {
      chatId,
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
  assistantTargetMessage: Message
}

const prepareMessagesForPrompt = (
  messages: Message[],
): PreparedMessagesForPrompt => {
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

  return {
    messages: llmMessagesPayload.map(transformMessageModelToPayload),
    assistantTargetMessage: assistantTargetMessage,
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

const getParsedBody = async (req: NextRequest) => {
  const json = (await req.json()) as unknown
  return zBody.parseAsync(json)
}

export const chatStreamedResponseHandler = withMiddlewareForAppRouter(handler)
