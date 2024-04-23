import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { Chat, Post, User, Workspace } from '@prisma/client'
import { getChatsService } from '../getChats.service'

const subject = async (
  userId: string,
  workspaceId: string,
  postId?: string,
) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  const payload = postId ? { postId } : undefined
  return await getChatsService(prisma, context, payload)
}

describe('getChatsService', () => {
  let workspace: Workspace
  let user: User
  let post1: Post
  let post2: Post
  let chat1: Chat
  let chat2: Chat
  let chat3: Chat

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    post1 = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })

    post2 = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })

    chat1 = await ChatFactory.create(prisma, {
      authorId: user.id,
      postId: post1.id,
    })

    chat2 = await ChatFactory.create(prisma, {
      authorId: user.id,
      postId: post1.id,
    })

    chat3 = await ChatFactory.create(prisma, {
      authorId: user.id,
      postId: post2.id,
    })
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
      // expect(result).toEqual(
      //   expect.arrayContaining([
      //     expect.objectContaining(chat1),
      //     expect.objectContaining(chat2),
      //   ]),
      // )
    })
  })
})
