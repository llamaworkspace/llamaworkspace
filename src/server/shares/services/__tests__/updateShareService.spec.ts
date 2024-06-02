import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { ShareScope } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, Share, User, Workspace } from '@prisma/client'
import { updateShareService } from '../updateShare.service'

const subject = async (
  userId: string,
  workspaceId: string,
  shareId: string,
  scope: ShareScope,
) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await updateShareService(prisma, context, {
    shareId,
    scope,
  })
}

describe('updateShareService', () => {
  let workspace: Workspace
  let userCreatingPost: User
  let app: App
  let share: Share

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    userCreatingPost = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    app = await PostFactory.create(prisma, {
      userId: userCreatingPost.id,
      workspaceId: workspace.id,
    })
    share = await prisma.share.findFirstOrThrow({
      where: { postId: app.id },
    })
  })

  it('updates the access scope', async () => {
    expect(share.scope).toBe(ShareScope.Private)
    await subject(
      userCreatingPost.id,
      workspace.id,
      share.id,
      ShareScope.Everybody,
    )

    const nextShare = await prisma.share.findUniqueOrThrow({
      where: { id: share.id },
    })
    expect(nextShare.scope).toBe(ShareScope.Everybody)
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(
      userCreatingPost.id,
      workspace.id,
      share.id,
      ShareScope.Everybody,
    )

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Invite,
      expect.anything(),
      expect.anything(),
    )
  })
})
