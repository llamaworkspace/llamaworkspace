import { getProviderAndModelFromFullSlug } from '@/server/ai/aiUtils'
import { aiProvidersFetcherService } from '@/server/ai/services/aiProvidersFetcher.service'
import { authOptions } from '@/server/auth/nextauth'
import {
  createUserOnWorkspaceContext,
  type UserOnWorkspaceContext,
} from '@/server/auth/userOnWorkspaceContext'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import type { PrismaTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import createHttpError from 'http-errors'
import { getServerSession } from 'next-auth'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { getApplicableAppConfigToChatService } from '../../services/getApplicableAppConfigToChat.service'

const zBody = z.object({
  threadId: z.null(),
  message: z.literal(''),
  data: z.object({
    chatId: z.string(),
  }),
})

export const getParsedBodyOrThrow = async (req: NextRequest) => {
  const { data } = zBody.parse(await req.json())
  return data
}

export const getSessionOrThrow = async () => {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw createHttpError(401, 'Unauthorized')
  }
  return session
}

export const getChatOrThrow = async (
  prisma: PrismaTrxClient,
  userId: string,
  chatId: string,
) => {
  const chat = await prisma.chat.findFirstOrThrow({
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

  await new PermissionsVerifier(prisma).passOrThrowTrpcError(
    PermissionAction.Use,
    userId,
    chat.appId,
  )

  return chat
}

export const createContext = async (
  prisma: PrismaTrxClient,
  workspaceId: string,
  userId: string,
) => {
  return await createUserOnWorkspaceContext(prisma, workspaceId, userId)
}

export const getAppConfigVersionForChat = async (
  prisma: PrismaTrxClient,
  uowContext: UserOnWorkspaceContext,
  chatId: string,
) => {
  return await getApplicableAppConfigToChatService(prisma, uowContext, {
    chatId,
  })
}

export const getMessagesForChat = async (
  prisma: PrismaTrxClient,
  chatId: string,
) => {
  return await prisma.message.findMany({
    where: {
      chatId,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })
}

export const validateModelIsEnabledOrThrow = async (
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
