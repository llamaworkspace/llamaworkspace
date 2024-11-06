import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { ShareTargetFactory } from '@/server/testing/factories/ShareTargetFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { WorkspaceInviteFactory } from '@/server/testing/factories/WorkspaceInviteFactory'
import { WorkspaceInviteSources } from '@/server/workspaces/workspaceTypes'
import { UserAccessLevel, UserAccessLevelActions } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { faker } from '@faker-js/faker'
import type {
  App,
  Share,
  ShareTarget,
  User,
  Workspace,
  WorkspaceInvite,
} from '@prisma/client'
import { updateShareAccessLevelService } from '../updateShareAccessLevel.service'

const subject = async (
  userId: string,
  workspaceId: string,
  shareTargetId: string,
  accessLevel: UserAccessLevelActions,
) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await updateShareAccessLevelService(prisma, context, {
    shareTargetId,
    accessLevel,
  })
}

describe('updateShareAccessLevelService', () => {
  let workspace: Workspace
  let userCreatingApp: User
  let userInvitedToApp: User
  let app: App
  let share: Share
  let shareTarget: ShareTarget

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    userCreatingApp = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    userInvitedToApp = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    app = await AppFactory.create(prisma, {
      userId: userCreatingApp.id,
      workspaceId: workspace.id,
    })

    share = await prisma.share.findFirstOrThrow({
      where: {
        appId: app.id,
      },
    })

    shareTarget = await ShareTargetFactory.create(prisma, {
      shareId: share.id,
      sharerId: userCreatingApp.id,
      userId: userInvitedToApp.id,
    })
  })

  it('updates the access level', async () => {
    expect(shareTarget.accessLevel).toBe(UserAccessLevel.Use)

    await subject(
      userCreatingApp.id,
      workspace.id,
      shareTarget.id,
      UserAccessLevelActions.Edit,
    )

    const nextShareTarget = await prisma.shareTarget.findUniqueOrThrow({
      where: { id: shareTarget.id },
    })

    expect(nextShareTarget.accessLevel).toBe(UserAccessLevel.Edit)
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(
      userCreatingApp.id,
      workspace.id,
      shareTarget.id,
      UserAccessLevelActions.Edit,
    )

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Invite,
      expect.anything(),
      expect.anything(),
    )
  })

  describe('when the access level is "remove"', () => {
    it('removes the share', async () => {
      const shareTargetsBefore = await prisma.shareTarget.findMany({
        where: {
          share: { appId: app.id },
        },
      })

      expect(shareTargetsBefore).toHaveLength(2)

      await subject(
        userCreatingApp.id,
        workspace.id,
        shareTarget.id,
        UserAccessLevelActions.Remove,
      )

      const shareTargetsAfter = await prisma.shareTarget.findMany({
        where: {
          share: { appId: app.id },
        },
      })
      expect(shareTargetsAfter).toHaveLength(1)
    })

    describe('and the target is the owner', () => {
      it('throws an error', async () => {
        const shareTargetInDb = await prisma.shareTarget.findFirstOrThrow({
          where: {
            userId: userCreatingApp.id,
            accessLevel: UserAccessLevel.Owner.toString(),
            share: {
              appId: app.id,
            },
          },
        })

        await expect(
          subject(
            userCreatingApp.id,
            workspace.id,
            shareTargetInDb.id,
            UserAccessLevelActions.Remove,
          ),
        ).rejects.toThrow('Owner cannot be removed')
      })
    })

    describe('and the share is an invite (not a user)', () => {
      it('when the workspaceInvite source is not "share", it keeps the invite', async () => {
        const fakeEmail = faker.internet.email()
        const workspaceInvite = await WorkspaceInviteFactory.create(prisma, {
          email: fakeEmail,
          workspaceId: workspace.id,
          source: WorkspaceInviteSources.Direct,
          invitedById: userCreatingApp.id,
        })

        const shareTargetOfTheInvitedUser = await ShareTargetFactory.create(
          prisma,
          {
            shareId: share.id,
            sharerId: userCreatingApp.id,
            workspaceInviteId: workspaceInvite.id,
          },
        )

        await subject(
          userCreatingApp.id,
          workspace.id,
          shareTargetOfTheInvitedUser.id,
          UserAccessLevelActions.Remove,
        )

        const nextWorkspaceInvite =
          await prisma.workspaceInvite.findFirstOrThrow({
            where: { id: workspaceInvite.id },
          })

        expect(shareTargetOfTheInvitedUser.workspaceInviteId).toEqual(
          nextWorkspaceInvite.id,
        )
      })

      describe('when the workspaceInvite source is "share"', () => {
        let fakeEmail: string
        let workspaceInvite: WorkspaceInvite
        let shareOfTheInvitedUser: ShareTarget

        beforeEach(async () => {
          fakeEmail = faker.internet.email()
          workspaceInvite = await WorkspaceInviteFactory.create(prisma, {
            email: fakeEmail,
            workspaceId: workspace.id,
            source: WorkspaceInviteSources.Share,
            invitedById: userCreatingApp.id,
          })

          shareOfTheInvitedUser = await ShareTargetFactory.create(prisma, {
            shareId: share.id,
            sharerId: userCreatingApp.id,
            workspaceInviteId: workspaceInvite.id,
          })
        })

        it('and it is the last app where the user is invited, it deletes the invite', async () => {
          await subject(
            userCreatingApp.id,
            workspace.id,
            shareOfTheInvitedUser.id,
            UserAccessLevelActions.Remove,
          )

          const nextWorkspaceInvite = await prisma.workspaceInvite.findFirst({
            where: { id: workspaceInvite.id },
          })

          expect(nextWorkspaceInvite).toBeNull()
        })

        it('and it is not the last app where the user is invited, it keeps the invite', async () => {
          const otherApp = await AppFactory.create(prisma, {
            userId: userCreatingApp.id,
            workspaceId: workspace.id,
          })

          const shareForOtherApp = await prisma.share.findFirstOrThrow({
            where: {
              appId: otherApp.id,
            },
          })

          const otherShareToTheInvitedUser = await ShareTargetFactory.create(
            prisma,
            {
              shareId: shareForOtherApp.id,
              sharerId: userCreatingApp.id,
              workspaceInviteId: workspaceInvite.id,
            },
          )

          await subject(
            userCreatingApp.id,
            workspace.id,
            otherShareToTheInvitedUser.id,
            UserAccessLevelActions.Remove,
          )

          const nextWorkspaceInvite =
            await prisma.workspaceInvite.findFirstOrThrow({
              where: { id: workspaceInvite.id },
            })

          expect(otherShareToTheInvitedUser.workspaceInviteId).toEqual(
            nextWorkspaceInvite.id,
          )
        })
      })
    })
  })

  describe('when the user is a workspace invite', () => {
    let fakeEmail: string
    let workspaceInvite: WorkspaceInvite
    let shareOfTheInvitedUser: ShareTarget

    beforeEach(async () => {
      fakeEmail = faker.internet.email()
      workspaceInvite = await WorkspaceInviteFactory.create(prisma, {
        email: fakeEmail,
        workspaceId: workspace.id,
        source: WorkspaceInviteSources.Share,
        invitedById: userCreatingApp.id,
      })

      shareOfTheInvitedUser = await ShareTargetFactory.create(prisma, {
        shareId: share.id,
        sharerId: userCreatingApp.id,
        workspaceInviteId: workspaceInvite.id,
      })
    })

    it('updates the access level', async () => {
      expect(shareOfTheInvitedUser.accessLevel).toBe(UserAccessLevel.Use)

      await subject(
        userCreatingApp.id,
        workspace.id,
        shareOfTheInvitedUser.id,
        UserAccessLevelActions.Edit,
      )

      const nextShareTarget = await prisma.shareTarget.findUniqueOrThrow({
        where: { id: shareOfTheInvitedUser.id },
      })

      expect(nextShareTarget.accessLevel).toBe(UserAccessLevel.Edit)
    })
  })
})
