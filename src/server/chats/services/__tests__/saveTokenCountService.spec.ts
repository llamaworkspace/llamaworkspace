import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { ChatRunFactory } from '@/server/testing/factories/ChatRunFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { App, Chat, ChatRun, User, Workspace } from '@prisma/client'
import { saveTokenCountService } from '../saveTokenCount.service'

const subject = async (
  workspaceId: string,
  userId: string,
  payload: { chatRunId: string; requestTokens: number; responseTokens: number },
) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await saveTokenCountService(prisma, uowContext, payload)
}

describe('saveTokenCountForChatRunService', () => {
  let workspace: Workspace
  let user: User
  let app: App
  let chat: Chat
  let chatRun: ChatRun

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

    chatRun = await ChatRunFactory.create(prisma, {
      chatId: chat.id,
    })
  })

  it('updates the token count', async () => {
    const chatRunBefore = await prisma.chatRun.findFirstOrThrow({
      where: {
        id: chatRun.id,
      },
    })
    expect(chatRunBefore.requestTokens).toBeNull()
    expect(chatRunBefore.responseTokens).toBeNull()

    await subject(workspace.id, user.id, {
      chatRunId: chatRun.id,
      requestTokens: 10,
      responseTokens: 20,
    })

    const chatRunAfter = await prisma.chatRun.findFirstOrThrow({
      where: {
        id: chatRun.id,
      },
    })
    expect(chatRunAfter.requestTokens).toEqual(10)
    expect(chatRunAfter.responseTokens).toEqual(20)
  })
})
