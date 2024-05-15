import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { Post, PostConfigVersion, User, Workspace } from '@prisma/client'
import { postConfigVersionUpdateService } from '../postConfigVersionUpdate.service'

interface SubjectPayload {
  description?: string | null
  systemMessage?: string
  model?: string
}

const subject = async (
  workspaceId: string,
  userId: string,
  postConfigVersionId: string,
  payload: SubjectPayload = {},
) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  return await postConfigVersionUpdateService(prisma, uowContext, {
    ...payload,
    id: postConfigVersionId,
  })
}

describe('postConfigVersionUpdateService', () => {
  let workspace: Workspace
  let user: User
  let post: Post & { postConfigVersions: PostConfigVersion[] }
  let postConfigVersion: PostConfigVersion

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    const _post = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
      title: 'A title',
    })
    post = await prisma.post.findFirstOrThrow({
      where: {
        id: _post.id,
      },
      include: {
        postConfigVersions: true,
      },
    })

    postConfigVersion = post.postConfigVersions[0]!
  })

  it('updates the postConfigVersion', async () => {
    const result = await subject(workspace.id, user.id, postConfigVersion.id, {
      description: 'A new description',
    })

    expect(result.description).toBe('A new description')
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(workspace.id, user.id, postConfigVersion.id, {
      description: 'A new description',
    })

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Update,
      expect.anything(),
      expect.anything(),
    )
  })

  describe('when there are chats using the configversion', () => {
    beforeEach(async () => {
      await ChatFactory.create(prisma, {
        postId: post.id,
        authorId: user.id,
        postConfigVersionId: postConfigVersion.id,
      })
    })

    it('creates a new postConfigVersion', async () => {
      expect(
        await prisma.postConfigVersion.count({
          where: {
            postId: post.id,
          },
        }),
      ).toBe(1)

      await subject(workspace.id, user.id, postConfigVersion.id, {
        description: 'A new description',
      })

      expect(
        await prisma.postConfigVersion.count({
          where: {
            postId: post.id,
          },
        }),
      ).toBe(2)
    })
  })

  describe('when description is null', () => {
    it('updates the postConfigVersion', async () => {
      await prisma.postConfigVersion.update({
        where: {
          id: postConfigVersion.id,
        },
        data: {
          description: 'A description',
        },
      })

      const result = await subject(
        workspace.id,
        user.id,
        postConfigVersion.id,
        {
          description: null,
        },
      )

      expect(result.description).toBeNull()
    })
  })

  describe('when systemMessage is provided', () => {
    it('updates the system message', async () => {
      const postConfigVersionInDbBefore =
        await prisma.postConfigVersion.findFirstOrThrow({
          where: {
            id: postConfigVersion.id,
          },
          include: {
            messages: true,
          },
        })

      expect(postConfigVersionInDbBefore.messages[0]!.message).not.toBe(
        'A new system message',
      )

      await subject(workspace.id, user.id, postConfigVersion.id, {
        systemMessage: 'A new system message',
      })
      const postConfigVersionInDb =
        await prisma.postConfigVersion.findFirstOrThrow({
          where: {
            id: postConfigVersion.id,
          },
          include: {
            messages: true,
          },
        })

      expect(postConfigVersionInDb.messages[0]!.message).toBe(
        'A new system message',
      )
    })
  })

  describe('when the post is the default one', () => {
    beforeEach(async () => {
      await prisma.post.update({
        where: {
          id: post.id,
        },
        data: {
          isDefault: true,
        },
      })
    })
    it('throws an error', async () => {
      await expect(
        subject(workspace.id, user.id, postConfigVersion.id, {
          description: 'A new description',
        }),
      ).rejects.toThrow()
    })
  })
})
