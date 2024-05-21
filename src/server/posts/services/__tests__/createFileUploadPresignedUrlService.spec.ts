import { AppFileStatus } from '@/components/posts/postsTypes'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import type { Post, User, Workspace } from '@prisma/client'
import { createFileUploadPresignedUrlService } from '../createFileUploadPresignedUrl.service'

jest.mock('@aws-sdk/s3-presigned-post', () => {
  return {
    createPresignedPost: jest.fn(() => {
      return {
        url: 'https://example.com',
      }
    }),
  }
})

const subject = async (
  workspaceId: string,
  userId: string,
  postId: string,
  fileName: string,
) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await createFileUploadPresignedUrlService(prisma, uowContext, {
    postId,
    fileName,
  })
}

describe('createFileUploadPresignedUrlService', () => {
  let workspace: Workspace
  let user: User
  let post: Post
  let expectedPath: string

  beforeEach(async () => {
    jest.clearAllMocks()
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    post = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })

    expectedPath = `workspaces/${workspace.id}/apps/${post.id}.txt`
  })

  it('creates a file reference', async () => {
    const fileName = 'file.txt'

    await subject(workspace.id, user.id, post.id, fileName)
    const fileReference = await prisma.appFile.findMany({
      where: {
        appId: post.id,
      },
    })

    expect(fileReference).toHaveLength(1)
    expect(fileReference[0]).toEqual(
      expect.objectContaining({
        appId: post.id,
        status: AppFileStatus.Pending,
        originalName: fileName,
        path: expectedPath,
      }),
    )
  })

  it('returns the presignedUrl and appId', async () => {
    const fileName = 'file.txt'

    const response = await subject(workspace.id, user.id, post.id, fileName)

    expect(response.presignedUrl).toEqual({ url: 'https://example.com' })
    expect(response.appFile).toEqual(
      expect.objectContaining({
        appId: post.id,
      }),
    )
  })

  it('generates an aws sdk url', async () => {
    const fileName = 'file.txt'
    await subject(workspace.id, user.id, post.id, fileName)

    expect(createPresignedPost).toHaveBeenCalledTimes(1)
    expect(createPresignedPost).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        Key: expectedPath,
      }),
    )
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(workspace.id, user.id, post.id, 'file.txt')

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Update,
      expect.anything(),
      expect.anything(),
    )
  })

  describe('when the file does not have an extension', () => {
    it('stores a file reference without an extension', async () => {
      const fileName = 'file'

      await subject(workspace.id, user.id, post.id, fileName)
      const fileReference = await prisma.appFile.findMany({
        where: {
          appId: post.id,
        },
      })

      expect(fileReference).toHaveLength(1)
      expect(fileReference[0]).toEqual(
        expect.objectContaining({
          appId: post.id,
          status: AppFileStatus.Pending,
          originalName: fileName,
          path: expectedPath.replace('.txt', ''),
        }),
      )
    })
  })
})
