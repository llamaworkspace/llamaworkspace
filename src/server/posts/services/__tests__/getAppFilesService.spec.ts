import { AppFileStatus } from '@/components/posts/postsTypes'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppFileFactory } from '@/server/testing/factories/AppFileFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { AppFile, Post, User, Workspace } from '@prisma/client'
import { getAppFilesService } from '../getAppFiles.service'

const subject = async (workspaceId: string, userId: string, appId: string) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await getAppFilesService(prisma, context, { appId })
}

describe('getAppFilesService', () => {
  let workspace: Workspace
  let user: User
  let post: Post
  let appFileSuccess1: AppFile
  let appFileSuccess2: AppFile
  let appFileSuccessForOtherApp: AppFile
  let appFilePending: AppFile

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    post = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })
    const otherPost = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })

    appFileSuccess1 = await AppFileFactory.create(prisma, {
      appId: post.id,
      originalName: 'file.txt',
      status: AppFileStatus.Success,
    })
    appFileSuccess2 = await AppFileFactory.create(prisma, {
      appId: post.id,
      originalName: 'file.txt',
      status: AppFileStatus.Success,
    })
    appFileSuccessForOtherApp = await AppFileFactory.create(prisma, {
      appId: otherPost.id,
      originalName: 'file.txt',
      status: AppFileStatus.Success,
    })
    appFilePending = await AppFileFactory.create(prisma, {
      appId: post.id,
      originalName: 'file.txt',
      status: AppFileStatus.Pending,
    })
  })

  it('returns the posts', async () => {
    const result = await subject(workspace.id, user.id, post.id)
    expect(result).toHaveLength(2)
    expect(result[0]!.id).toEqual(appFileSuccess1.id)
    expect(result[1]!.id).toEqual(appFileSuccess2.id)
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )
    await subject(workspace.id, user.id, post.id)

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Update,
      expect.anything(),
      expect.anything(),
    )
  })
})
