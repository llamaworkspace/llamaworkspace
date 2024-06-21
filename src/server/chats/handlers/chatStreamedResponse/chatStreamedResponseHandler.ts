import { AppEngineRunner } from '@/server/ai/lib/AppEngineRunner/AppEngineRunner'
import { DefaultAppEngine } from '@/server/ai/lib/DefaultAppEngine'
import { authOptions } from '@/server/auth/nextauth'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { withMiddlewareForAppRouter } from '@/server/middlewares/withMiddleware'
import createHttpError from 'http-errors'
import { getServerSession } from 'next-auth'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

const zBody = z.object({
  threadId: z.null(),
  message: z.literal(''),
  data: z.object({
    chatId: z.string(),
  }),
})

async function handler(req: NextRequest) {
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

  const engines = [new DefaultAppEngine()]

  const appEngineRunner = new AppEngineRunner(prisma, context, engines)
  return await appEngineRunner.call(chatId)
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
