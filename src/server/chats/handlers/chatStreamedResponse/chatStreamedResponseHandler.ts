import { chatEditionFilter } from '@/components/chats/backend/chatsBackendUtils'
import { env } from '@/env.mjs'
import { getEnumByValue } from '@/lib/utils'
import { aiRegistry } from '@/server/ai/aiRegistry'
import { getAiProviderKVs } from '@/server/ai/services/getProvidersForWorkspace.service'
import { authOptions } from '@/server/auth/nextauth'
import { prisma } from '@/server/db'
import type { AiRegistryMessage } from '@/server/lib/ai-registry/aiRegistryTypes'
import { nextApiSessionChecker } from '@/server/lib/apiUtils'
import { withMiddleware } from '@/server/middlewares/withMiddleware'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { getPostConfigForChatIdService } from '@/server/posts/services/getPostConfigForChatId.service'
import {
  Author,
  OpenAiModelEnum,
  OpenaiInternalModelToApiModel,
} from '@/shared/aiTypesAndMappers'
import { errorLogger } from '@/shared/errors/errorLogger'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { Message, Workspace } from '@prisma/client'
import { streamToResponse } from 'ai'
import Promise from 'bluebird'
import createHttpError from 'http-errors'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import OpenAI from 'openai'
import { chain, isNull } from 'underscore'
import { doTokenCountForChatRun } from '../../services/doTokenCountForChatRun.service'
import {
  handleChatTitleCreate,
  registerTransaction,
} from './chatStreamedResponseHandlerUtils'

interface VoidIncomingMessage {
  role: string
  content: string
}

interface BodyPayload {
  chatId: string
  messages: VoidIncomingMessage[]
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  let tokenResponse = ''
  let openaiTargetMessageId: string | undefined = undefined

  try {
    await validateRequestOrThrow(req, res)

    const { chatId } = getParsedBody(req)
    const userId = await getRequestUserId(req, res)

    const [chat, postConfigVersion, messages] = await Promise.all([
      await getChat(chatId, userId),
      await getPostConfigVersionForChat(chatId, userId),
      await getParsedMessagesForChat(chatId, userId),
    ])

    const workspaceId = chat.post.workspaceId
    const workspace = await prisma.workspace.findFirstOrThrow({
      where: { id: workspaceId },
    })

    await validateUserPermissionsOrThrow(userId, chatId)

    const { hasOwnApiKey, openAiKey } = getOpenAiApiKeys(workspace)

    const allUnprocessedMessages = [...postConfigVersion.messages, ...messages]

    const { messages: allMessages, openaiTargetMessage } =
      prepareMessagesForPrompt(allUnprocessedMessages)

    openaiTargetMessageId = openaiTargetMessage.id

    if (!chat.postConfigVersionId) {
      await attachPostConfigVersionToChat(chatId, postConfigVersion.id)
    }

    // Todo: Update chatRun as transaction, in fact run everything as a trx!
    const chatRun = await createChatRun(
      chatId,
      allUnprocessedMessages.map((m) => m.id),
    )

    void handleChatTitleCreate(prisma, workspaceId, userId, chatId)

    const targetProviderSlug = 'openai'

    const provider = aiRegistry.getProvider(targetProviderSlug)
    const providerKVs = await getAiProviderKVs(
      prisma,
      workspaceId,
      userId,
      targetProviderSlug,
    )

    if (targetProviderSlug === 'openai') {
      if (!providerKVs.apiKey && env.OPENAI_API_KEY) {
        providerKVs.apiKey = env.OPENAI_API_KEY
      }
      if (!providerKVs.baseURL && env.OPTIONAL_OPENAI_BASE_URL) {
        providerKVs.baseURL = env.OPTIONAL_OPENAI_BASE_URL
      }
    }

    const onFinal = async (final: string) => {
      await updateMessage(openaiTargetMessage.id, final)
      // Todo: Do async in a queue
      const nextChatRun = await doTokenCountForChatRun(prisma, chatRun.id)

      if (hasOwnApiKey) return
      if (
        isNull(nextChatRun.requestTokensCostInNanoCents) ||
        isNull(nextChatRun.responseTokensCostInNanoCents)
      ) {
        throw new Error(
          'nextChatRun.requestTokensCostInNanoCents or nextChatRun.responseTokensCostInNanoCents is null',
        )
      }

      const costInNanoCents =
        nextChatRun.requestTokensCostInNanoCents +
        nextChatRun.responseTokensCostInNanoCents
      await registerTransaction(
        prisma,
        workspaceId,
        userId,
        nextChatRun.id,
        costInNanoCents,
      )
    }

    const onToken = (token: string) => {
      tokenResponse += token
    }

    const dbModel = getEnumByValue(OpenAiModelEnum, postConfigVersion.model)
    const model = OpenaiInternalModelToApiModel[dbModel]

    const stream = await provider.executeAsStream(
      {
        model,
        messages: allMessages,
        onToken,
        onFinal,
      },
      providerKVs,
    )

    streamToResponse(stream, res)
  } catch (error) {
    if (tokenResponse.length && openaiTargetMessageId) {
      await updateMessage(openaiTargetMessageId, tokenResponse)
    }

    if (error instanceof OpenAI.APIError) {
      // Log to understand the different error types,
      // and the responses that the client sees.
      errorLogger(error)
      throw createHttpError(403, error.message)
    }
    throw error
  }
}

const validateRequestOrThrow = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  if (req.method !== 'POST') {
    throw createHttpError(404)
  }

  const sessionExists = await nextApiSessionChecker(req, res)
  if (!sessionExists) {
    throw createHttpError(401, 'You must be logged in.')
  }
  return true
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

const getRequestUserId = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)
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

const getOpenAiApiKeys = (workspace: Workspace) => {
  if (workspace.openAiApiKey) {
    return { hasOwnApiKey: true, openAiKey: workspace.openAiApiKey }
  }

  return { hasOwnApiKey: false, openAiKey: env.OPENAI_API_KEY }
}

interface PreparedMessagesForPrompt {
  messages: AiRegistryMessage[]
  openaiTargetMessage: Message
}

const prepareMessagesForPrompt = (
  messages: Message[],
): PreparedMessagesForPrompt => {
  if (messages.length < 2) {
    throw new Error('Message length should be at least 2')
  }

  // This last message should be maxCreatedAt where the author=OpenAi and should be empty
  // It shouldn't be sent to OpenAi
  const openaiTargetMessage = chain(messages)
    .filter(
      (message) =>
        message.author === (Author.Assistant as string) &&
        message.message === null,
    )
    .max((message) => message.createdAt.getTime())
    .value() as Message

  const openaAiMessagesPayload = messages.filter((message) => {
    if (openaiTargetMessage.id === message.id) {
      return false
    }
    return message.message !== null && message.message !== ''
  })

  return {
    messages: openaAiMessagesPayload.map(transformMessageModelToPayload),
    openaiTargetMessage,
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

const getParsedBody = (req: NextApiRequest) => {
  return req.body as BodyPayload
}

export default withMiddleware()(handler)
