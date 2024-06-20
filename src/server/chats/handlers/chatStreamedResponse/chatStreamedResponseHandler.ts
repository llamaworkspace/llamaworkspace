import { ensureError } from '@/lib/utils'
import { getProviderAndModelFromFullSlug } from '@/server/ai/aiUtils'
import { AppEngineRunner } from '@/server/ai/lib/AppEngineRunner/AppEngineRunner'
import { aiProvidersFetcherService } from '@/server/ai/services/aiProvidersFetcher.service'
import { authOptions } from '@/server/auth/nextauth'
import {
  createUserOnWorkspaceContext,
  type UserOnWorkspaceContext,
} from '@/server/auth/userOnWorkspaceContext'
import { getApplicableAppConfigToChatService } from '@/server/chats/services/getApplicableAppConfigToChat.service'
import { prisma } from '@/server/db'
import { withMiddlewareForAppRouter } from '@/server/middlewares/withMiddleware'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { errorLogger } from '@/shared/errors/errorLogger'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import createHttpError from 'http-errors'
import { getServerSession } from 'next-auth'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { handleChatTitleCreate } from './chatStreamedResponseHandlerUtils'

const zBody = z.object({
  threadId: z.null(),
  message: z.literal(''),
  data: z.object({
    chatId: z.string(),
  }),
})

async function handler(req: NextRequest) {
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

    const appConfigVersion = await getAppConfigVersionForChat(context, chatId)

    await validateModelIsEnabledOrThrow(
      workspaceId,
      userId,
      appConfigVersion.model,
    )

    void handleChatTitleCreate(prisma, workspaceId, userId, chatId)

    // TODO:  GESTIÓN DE ERRORES
    const onError = async (error: Error) => {
      // await deleteMessage(assistantTargetMessage.id)
      await Promise.resolve()
      errorLogger(error)
    }

    const appEngineRunner = new AppEngineRunner(prisma, context)
    return await appEngineRunner.call(chatId)
  } catch (_error) {
    const error = ensureError(_error)

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

const getRequestUserId = async () => {
  const session = await getServerSession(authOptions)

  if (!session) throw createHttpError(401, 'You must be logged in.')
  return session.user.id
}

const getParsedBody = async (req: NextRequest) => {
  const json = (await req.json()) as unknown
  return zBody.parseAsync(json)
}

export const chatStreamedResponseHandler = withMiddlewareForAppRouter(handler)
