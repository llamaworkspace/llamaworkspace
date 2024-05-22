import { FileUploadStatus } from '@/components/posts/postsTypes'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppFileFactory } from '@/server/testing/factories/AssetFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { AppFile, Post, User, Workspace } from '@prisma/client'
import { updateAppFileService } from '../updateAppFile.service'

const subject = async (
  workspaceId: string,
  userId: string,
  appFileId: string,
  payload: {
    status?: FileUploadStatus
  } = {},
) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  return await updateAppFileService(prisma, uowContext, {
    appFileId,
    ...payload,
  })
}

describe('updateAppFileService', () => {
  let workspace: Workspace
  let user: User
  let post: Post
  let appFile: AppFile

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    post = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
      title: 'A title',
    })
    appFile = await AppFileFactory.create(prisma, {
      appId: post.id,
      originalName: 'file.txt',
    })
  })

  it('updates the status', async () => {
    const before = await prisma.appFile.findFirstOrThrow({
      where: {
        id: appFile.id,
      },
    })
    expect(before.status).toBe(FileUploadStatus.Pending)

    await subject(workspace.id, user.id, appFile.id, {
      status: FileUploadStatus.Success,
    })

    const after = await prisma.appFile.findFirstOrThrow({
      where: {
        id: appFile.id,
      },
    })

    expect(after.status).toBe(FileUploadStatus.Success)
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(workspace.id, user.id, appFile.id, {
      status: FileUploadStatus.Success,
    })

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Update,
      expect.anything(),
      expect.anything(),
    )
  })
})
