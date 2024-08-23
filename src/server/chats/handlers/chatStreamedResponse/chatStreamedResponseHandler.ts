import {
  generateAiSdkCompatibleErrorString,
  isAiSdkErrorString,
  maskServerErrorString,
} from '@/lib/aiSdkUtils'
import { ensureError } from '@/lib/utils'
import { AppEngineRunner } from '@/server/ai/lib/AppEngineRunner/AppEngineRunner'
import { DefaultAppEngine } from '@/server/ai/lib/DefaultAppEngine'
import { ExternalAppEngine } from '@/server/ai/lib/ExternalAppEngine'
import { authOptions } from '@/server/auth/nextauth'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { enginesRegistry } from '@/server/extensions/appEngines/appEngines'
import { errorLogger } from '@/shared/errors/errorLogger'
import createHttpError from 'http-errors'
import { getServerSession } from 'next-auth'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

const zBody = z.object({
  threadId: z.string().nullable(),
  message: z.literal(''),
  data: z.object({
    chatId: z.string(),
  }),
})

const RESPONSE_HEADERS = {
  'Content-Type': 'text/event-stream',
}

// We must handle errors globally with 2 possibilities:
// 1. Before the stream is returned. => We catch them here
// 2. In-stream errors or any error happening during the stream. => We catch them in the stream
export async function chatStreamedResponseHandler(req: NextRequest) {
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

    const engines = [
      new DefaultAppEngine(),
      new ExternalAppEngine(),
      ...enginesRegistry,
    ]
    const appEngineRunner = new AppEngineRunner(prisma, context, engines)

    const stream = await appEngineRunner.call(chatId)

    const textDecoder = new TextDecoder()
    const textEncoder = new TextEncoder()
    const pipedStream = stream.pipeThrough<Uint8Array>(
      new TransformStream({
        transform: (chunk, controller) => {
          const text = textDecoder.decode(chunk)
          console.log(4444, text)
          if (isAiSdkErrorString(text)) {
            const errorString = maskServerErrorString(text)
            console.log(11122222, errorString)
            const encodedError = textEncoder.encode(errorString)
            controller.enqueue(encodedError)
            return
          }

          controller.enqueue(chunk)
        },
      }),
    )

    return new NextResponse(pipedStream, { headers: RESPONSE_HEADERS })
  } catch (_error) {
    // Here we will arrive and process all the errors BEFORE
    // the stream is returned.

    const error = ensureError(_error)
    errorLogger(error)

    const stringifiedError = maskServerErrorString(
      generateAiSdkCompatibleErrorString(error),
    )

    return new NextResponse(stringifiedError, { headers: RESPONSE_HEADERS })
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

  try {
    return zBody.parse(json)
  } catch (_error) {
    const error = ensureError(_error)
    throw createHttpError(500, error)
  }
}
