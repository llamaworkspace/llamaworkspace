import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { MessageFactory } from '@/server/testing/factories/MessageFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { App, Chat, User, Workspace } from '@prisma/client'
import { getChatsService } from '../getChats.service'

const subject = async (
  userId: string,
  workspaceId: string,
  postId?: string,
  excludeEmpty?: boolean,
) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  const payload: { postId?: string; excludeEmpty?: boolean } = {}

  if (postId) {
    payload.postId = postId
  }

  if (excludeEmpty) {
    payload.excludeEmpty = true
  }
  return await getChatsService(prisma, context, payload)
}

describe('getChatsService', () => {
  let workspace: Workspace
  let user: User
  let post1: App
  let post2: App
  let chat1: Chat
  let chat2: Chat
  let chat3: Chat

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    ;[post1, post2] = await Promise.all([
      PostFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      }),
      PostFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      }),
    ])
    ;[chat1, chat2, chat3] = await Promise.all([
      ChatFactory.create(prisma, {
        authorId: user.id,
        postId: post1.id,
      }),

      ChatFactory.create(prisma, {
        authorId: user.id,
        postId: post1.id,
      }),

      ChatFactory.create(prisma, {
        authorId: user.id,
        postId: post2.id,
      }),
    ])

    await Promise.all([
      MessageFactory.create(prisma, {
        chatId: chat1.id,
        message: 'Hello',
      }),
      MessageFactory.create(prisma, {
        chatId: chat2.id,
        message: 'Hello',
      }),
      MessageFactory.create(prisma, {
        chatId: chat3.id,
        message: 'Hello',
      }),
    ])
  })

  it('returns the chats', async () => {
    const result = await subject(user.id, workspace.id)

    const expectedIds = [chat1.id, chat2.id, chat3.id]
    const returnedIds = result.map((chat) => chat.id)
    expect(result).toHaveLength(3)
    expect(returnedIds).toEqual(expect.arrayContaining(expectedIds))
  })

  describe('when postId is passed', () => {
    it('returns the chats for the post', async () => {
      const result = await subject(user.id, workspace.id, post1.id)
      const expectedIds = [chat1.id, chat2.id]
      const returnedIds = result.map((chat) => chat.id)

      expect(result).toHaveLength(2)
      expect(returnedIds).toEqual(expect.arrayContaining(expectedIds))
    })
  })

  describe('when there are chats without messages', () => {
    let chat4: Chat

    beforeEach(async () => {
      chat4 = await ChatFactory.create(prisma, {
        authorId: user.id,
        postId: post1.id,
      })
    })

    it('returns all the chats anyway', async () => {
      const result = await subject(user.id, workspace.id)

      const expectedIds = [chat1.id, chat2.id, chat3.id, chat4.id]
      const returnedIds = result.map((chat) => chat.id)
      expect(result).toHaveLength(4)
      expect(returnedIds).toEqual(expect.arrayContaining(expectedIds))
    })

    describe('and excludeEmpty is true', () => {
      it('returns only the chats with messages', async () => {
        const result = await subject(user.id, workspace.id, undefined, true)

        const expectedIds = [chat1.id, chat2.id, chat3.id]
        const returnedIds = result.map((chat) => chat.id)
        expect(result).toHaveLength(3)
        expect(returnedIds).toEqual(expect.arrayContaining(expectedIds))
      })
    })
  })
})
