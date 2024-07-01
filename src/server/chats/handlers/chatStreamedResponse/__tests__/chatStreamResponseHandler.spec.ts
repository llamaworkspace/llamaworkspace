import { AppEngineRunner } from '@/server/ai/lib/AppEngineRunner/AppEngineRunner'
import { prisma } from '@/server/db'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { MessageFactory } from '@/server/testing/factories/MessageFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { Author } from '@/shared/aiTypesAndMappers'
import type { App, Chat, User, Workspace } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { chatStreamedResponseHandler } from '../chatStreamedResponseHandler'

jest.mock('next-auth', () => {
  return {
    getServerSession: jest.fn(),
  }
})

// This is needed to avoid TS errors in the chalk lib
jest.mock('@/shared/errors/errorLogger.ts', () => {
  return {
    errorLogger: jest.fn(),
  }
})

// Important: Do not remove this mock, as it would generate
// LLM API calls
jest.mock('@/server/ai/lib/AppEngineRunner/AppEngineRunner')

const subject = async (
  data: Record<string, string>,
  userId?: string | null,
) => {
  const body = {
    threadId: null,
    message: '',
    data,
  }
  const nextAuth = await import('next-auth')
  const resolvedValueForNextAuth = userId ? { user: { id: userId } } : null
  jest
    .spyOn(nextAuth, 'getServerSession')
    .mockResolvedValue(resolvedValueForNextAuth)
  const request = new NextRequest('https://llamaworkspace.ai/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const response = new NextResponse()
  return (await chatStreamedResponseHandler(
    request,
    response,
  )) as unknown as Promise<NextResponse>
}

describe('chatStreamedResponseHandler', () => {
  let workspace: Workspace
  let user: User
  let app: App
  let chat: Chat

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    app = await AppFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })
    chat = await ChatFactory.create(prisma, {
      appId: app.id,
      authorId: user.id,
    })
    await MessageFactory.create(prisma, {
      chatId: chat.id,
      author: Author.User,
      message: 'Hello',
    })
    await MessageFactory.create(prisma, {
      chatId: chat.id,
      author: Author.Assistant,
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls AppEngineRunner', async () => {
    const spy = jest.spyOn(AppEngineRunner.prototype, 'call')

    await subject(
      {
        chatId: chat.id,
      },
      user.id,
    )

    expect(spy).toHaveBeenCalled()
  })

  it('fails on a non-valid body', async () => {
    const res = await subject(
      {
        chatIdxx: '123',
      },
      user.id,
    )

    const body = await res.text()

    // For this endpoint, we always 200 and return ai-sdk compatible errors
    expect(res.status).toBe(200)
    expect(body).toBe('3:"Internal Server Error"\n')
  })

  describe('when unauthenticated', () => {
    beforeEach(async () => {
      const nextAuth = await import('next-auth')
      jest.spyOn(nextAuth, 'getServerSession').mockResolvedValue(null)
    })

    it('fails with Unauthorized', async () => {
      const res = await subject(
        {
          chatId: chat.id,
        },
        null,
      )

      const body = await res.text()

      // For this endpoint, we always 200 and return ai-sdk compatible errors
      expect(res.status).toBe(200)
      expect(body).toBe('3:"You must be logged in."\n')
    })
  })
})
