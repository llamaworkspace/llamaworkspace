import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import * as updatePostSortingServiceWrapper from '@/server/posts/services/updatePostSorting.service'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { Post, User, Workspace } from '@prisma/client'
import { createChatService } from '../createChat.service'

jest.mock('@/server/posts/services/updatePostSorting.service', () => {
  const original = jest.requireActual(
    '@/server/posts/services/updatePostSorting.service',
  ) as unknown as typeof updatePostSortingServiceWrapper

  return {
    updatePostSortingService: jest.fn(original.updatePostSortingService),
  }
})

beforeEach(() => {
  jest.clearAllMocks()
})

const subject = async (workspaceId: string, userId: string, postId: string) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await createChatService(prisma, uowContext, { postId })
}

describe('createChatService', () => {
  let workspace: Workspace
  let user: User
  let post: Post

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    post = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })
  })

  it('creates a chat', async () => {
    const result = await subject(workspace.id, user.id, post.id)
    const dbChat = await prisma.chat.findFirstOrThrow({
      where: {
        post: {
          id: post.id,
        },
      },
    })
    expect(dbChat.id).toEqual(result.id)
  })

  it('creates a postsOnUsers record', async () => {
    await subject(workspace.id, user.id, post.id)
    const dbPostsOnUsers = await prisma.postsOnUsers.findFirstOrThrow({
      where: {
        postId: post.id,
        userId: user.id,
      },
    })
    expect(dbPostsOnUsers.id).toBeDefined()
  })

  it('invokes updatePostSortingService', async () => {
    await subject(workspace.id, user.id, post.id)

    expect(
      updatePostSortingServiceWrapper.updatePostSortingService,
    ).toHaveBeenCalled()
  })

  describe('when the post is default', () => {
    let defaultPost: Post

    beforeEach(async () => {
      defaultPost = await PostFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
        isDefault: true,
      })
    })

    it('creates a postConfigVersion', async () => {
      const result = await subject(workspace.id, user.id, defaultPost.id)

      const dbPostConfigVersion =
        await prisma.postConfigVersion.findFirstOrThrow({
          where: {
            postId: defaultPost.id,
          },
        })

      expect(result.postConfigVersionId).toEqual(dbPostConfigVersion.id)
      expect(dbPostConfigVersion.model).toEqual('openai/gpt-3.5-turbo')
    })

    it('does not update post sorting', async () => {
      await subject(workspace.id, user.id, defaultPost.id)
      expect(
        updatePostSortingServiceWrapper.updatePostSortingService,
      ).not.toHaveBeenCalled()
    })
  })
})
