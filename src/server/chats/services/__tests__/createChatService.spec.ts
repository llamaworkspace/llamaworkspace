import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import * as updatePostSortingServiceWrapper from '@/server/posts/services/updatePostSorting.service'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
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

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )
    await subject(workspace.id, user.id, post.id)

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Use,
      expect.anything(),
      expect.anything(),
    )
  })

  it('creates a appsOnUsers record', async () => {
    await subject(workspace.id, user.id, post.id)
    const dbAppsOnUsers = await prisma.appsOnUsers.findFirstOrThrow({
      where: {
        appId: post.id,
        userId: user.id,
      },
    })
    expect(dbAppsOnUsers.id).toBeDefined()
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

    it('creates a appConfigVersion', async () => {
      const result = await subject(workspace.id, user.id, defaultPost.id)

      const dbAppConfigVersion = await prisma.appConfigVersion.findFirstOrThrow(
        {
          where: {
            appId: defaultPost.id,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      )

      expect(result.appConfigVersionId).toEqual(dbAppConfigVersion.id)
      expect(dbAppConfigVersion.model).toEqual(user.defaultModel)
    })

    it('does not update post sorting', async () => {
      await subject(workspace.id, user.id, defaultPost.id)
      expect(
        updatePostSortingServiceWrapper.updatePostSortingService,
      ).not.toHaveBeenCalled()
    })
  })
})