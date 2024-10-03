import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { ShareTargetFactory } from '@/server/testing/factories/ShareTargetFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { WorkspaceInviteFactory } from '@/server/testing/factories/WorkspaceInviteFactory'
import { ShareScope, UserAccessLevel } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { faker } from '@faker-js/faker'
import type { App, User, Workspace } from '@prisma/client'
import { getAppSharesService } from '../getAppShares.service'

const subject = async (userId: string, workspaceId: string, appId: string) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await getAppSharesService(prisma, context, { appId })
}

describe('getAppSharesService', () => {
  let workspace: Workspace
  let userAppOwner: User
  let sharedUser: User
  let app: App

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    userAppOwner = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    sharedUser = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    app = await AppFactory.create(prisma, {
      userId: userAppOwner.id,
      workspaceId: workspace.id,
    })
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(userAppOwner.id, workspace.id, app.id)
    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Invite,
      expect.anything(),
      expect.anything(),
    )
  })

  describe('when scope is "user"', () => {
    it('returns the share with scope User', async () => {
      const share = await prisma.share.findFirstOrThrow({
        where: {
          appId: app.id,
        },
      })

      const otherSharedUser = await UserFactory.create(prisma, {
        workspaceId: workspace.id,
      })

      await ShareTargetFactory.create(prisma, {
        shareId: share.id,
        sharerId: userAppOwner.id,
        userId: sharedUser.id,
      })
      await ShareTargetFactory.create(prisma, {
        shareId: share.id,
        sharerId: userAppOwner.id,
        userId: otherSharedUser.id,
      })

      const result = await subject(userAppOwner.id, workspace.id, app.id)

      expect(result.shareTargets).toHaveLength(3)
      expect(result.shareTargets).toEqual([
        expect.objectContaining({
          shareId: share.id,
          sharerId: userAppOwner.id,
          userId: userAppOwner.id,
          workspaceInviteId: null,
          accessLevel: UserAccessLevel.Owner.toString(),
        }),
        expect.objectContaining({
          shareId: share.id,
          sharerId: userAppOwner.id,
          userId: sharedUser.id,
          workspaceInviteId: null,
          accessLevel: UserAccessLevel.Use.toString(),
        }),
        expect.objectContaining({
          shareId: share.id,
          sharerId: userAppOwner.id,
          userId: otherSharedUser.id,
          workspaceInviteId: null,
          accessLevel: UserAccessLevel.Use.toString(),
        }),
      ])
    })
  })

  describe('when scope is "everybody"', () => {
    it('returns the share with scope Everybody', async () => {
      await prisma.share.update({
        where: {
          appId: app.id,
        },
        data: {
          scope: ShareScope.Everybody,
        },
      })

      const result = await subject(userAppOwner.id, workspace.id, app.id)

      expect(result).toEqual(
        expect.objectContaining({
          scope: ShareScope.Everybody,
        }),
      )
    })
  })

  describe('when there are users not in the workspace', () => {
    it('returns the invitees', async () => {
      const share = await prisma.share.findFirstOrThrow({
        where: {
          appId: app.id,
        },
      })

      const invitedMember = await WorkspaceInviteFactory.create(prisma, {
        workspaceId: workspace.id,
        email: faker.internet.email(),
        invitedById: userAppOwner.id,
      })

      await ShareTargetFactory.create(prisma, {
        shareId: share.id,
        sharerId: userAppOwner.id,
        workspaceInviteId: invitedMember.id,
      })

      const result = await subject(userAppOwner.id, workspace.id, app.id)

      expect(result.shareTargets).toHaveLength(2)
      expect(result.shareTargets).toEqual([
        expect.objectContaining({
          shareId: share.id,
          sharerId: userAppOwner.id,
          userId: userAppOwner.id,
          workspaceInviteId: null,
          accessLevel: UserAccessLevel.Owner.toString(),
        }),
        expect.objectContaining({
          shareId: share.id,
          sharerId: userAppOwner.id,
          userId: null,
          workspaceInviteId: invitedMember.id,
          accessLevel: UserAccessLevel.Use.toString(),
        }),
      ])
    })
  })
})
