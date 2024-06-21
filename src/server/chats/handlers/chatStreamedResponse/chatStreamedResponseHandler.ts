import { ensureError } from '@/lib/utils'
import { AppEngineRunner } from '@/server/ai/lib/AppEngineRunner/AppEngineRunner'
import { DefaultAppEngineV2 } from '@/server/ai/lib/DefaultAppEngineV2'
import { authOptions } from '@/server/auth/nextauth'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { withMiddlewareForAppRouter } from '@/server/middlewares/withMiddleware'
import { errorLogger } from '@/shared/errors/errorLogger'
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

    const userId = await getSessionUserId()
    const chat = await getChat(chatId)
    const workspaceId = chat.app.workspaceId

    const context = await createUserOnWorkspaceContext(
      prisma,
      workspaceId,
      userId,
    )

    void handleChatTitleCreate(prisma, workspaceId, userId, chatId)

    // TODO:  GESTIÓN DE ERRORES
    const onError = async (error: Error) => {
      // await deleteMessage(assistantTargetMessage.id)
      await Promise.resolve()
      errorLogger(error)
    }

    const engines = [new DefaultAppEngineV2()]

    const appEngineRunner = new AppEngineRunner(prisma, context, engines)
    return await appEngineRunner.call(chatId)
  } catch (_error) {
    const error = ensureError(_error)

    errorLogger(error)
    throw createHttpError(403, error.message)
  }
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

const getSessionUserId = async () => {
  const session = await getServerSession(authOptions)

  if (!session) throw createHttpError(401, 'You must be logged in.')
  return session.user.id
}

const getParsedBody = async (req: NextRequest) => {
  const json = (await req.json()) as unknown
  return zBody.parseAsync(json)
}

export const chatStreamedResponseHandler = withMiddlewareForAppRouter(handler)
