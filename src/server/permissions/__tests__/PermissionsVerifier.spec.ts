import { prisma } from '@/server/db'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { ShareTargetFactory } from '@/server/testing/factories/ShareTargetFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { ShareScope, UserAccessLevel } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, User, Workspace } from '@prisma/client'
import { PermissionsVerifier } from '../PermissionsVerifier'

describe('PermissionsVerifier ', () => {
  let workspace: Workspace
  let user: User
  let app: App

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    app = await AppFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })
  })

  describe('getAccessLevelForApp', () => {
    const subject = async (userId: string, appId: string) => {
      return await new PermissionsVerifier(prisma).getUserAccessLevelToApp(
        userId,
        appId,
      )
    }

    it('it returns the userAccessLevel', async () => {
      expect(await subject(user.id, app.id)).toBe(UserAccessLevel.Owner)
    })

    describe('when there is no relation between the user and the app', () => {
      it('it returns null', async () => {
        const tempUser = await UserFactory.create(prisma, {
          workspaceId: workspace.id,
        })

        expect(await subject(tempUser.id, app.id)).toBeNull()
      })
    })

    describe('when there are multiple shareTargets for the same app', () => {
      it('it throws', async () => {
        const share = await prisma.share.findFirstOrThrow({
          where: {
            appId: app.id,
          },
        })

        await prisma.shareTarget.create({
          data: {
            userId: user.id,
            sharerId: user.id,
            shareId: share.id,
            accessLevel: UserAccessLevel.Use,
          },
        })

        await expect(subject(user.id, app.id)).rejects.toThrow(
          'Multiple share targets found for the same user and app',
        )
      })
    })
  })

  describe('call', () => {
    const subject = async (
      action: PermissionAction,
      userId: string,
      appId: string,
      appScope: ShareScope,
    ) => {
      await prisma.share.update({
        where: {
          appId,
        },
        data: {
          scope: appScope,
        },
      })
      return await new PermissionsVerifier(prisma).call(action, userId, appId)
    }

    let workspace: Workspace
    let user: User
    let app: App

    beforeEach(async () => {
      workspace = await WorkspaceFactory.create(prisma)

      user = await UserFactory.create(prisma, {
        workspaceId: workspace.id,
      })

      app = await AppFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
    })

    describe('when the share scope is User', () => {
      describe('when the user is owner of the app', () => {
        it('allows update', async () => {
          expect(
            await subject(
              PermissionAction.Update,
              user.id,
              app.id,
              ShareScope.User,
            ),
          ).toBe(true)
        })
        it('allows delete', async () => {
          expect(
            await subject(
              PermissionAction.Delete,
              user.id,
              app.id,
              ShareScope.User,
            ),
          ).toBe(true)
        })
        it('allows invite', async () => {
          expect(
            await subject(
              PermissionAction.Invite,
              user.id,
              app.id,
              ShareScope.User,
            ),
          ).toBe(true)
        })
        it('allows use', async () => {
          expect(
            await subject(
              PermissionAction.Use,
              user.id,
              app.id,
              ShareScope.User,
            ),
          ).toBe(true)
        })
      })

      describe('when the user is editor of the app', () => {
        let targetUser: User
        beforeEach(async () => {
          targetUser = await UserFactory.create(prisma, {
            workspaceId: workspace.id,
          })

          const share = await prisma.share.findFirstOrThrow({
            where: {
              appId: app.id,
            },
          })

          await ShareTargetFactory.create(prisma, {
            sharerId: user.id,
            shareId: share.id,
            userId: targetUser.id,
            accessLevel: UserAccessLevel.Edit,
          })
        })
        it('allows update', async () => {
          expect(
            await subject(
              PermissionAction.Update,
              targetUser.id,
              app.id,
              ShareScope.User,
            ),
          ).toBe(true)
        })
        it('does not allow delete', async () => {
          expect(
            await subject(
              PermissionAction.Delete,
              targetUser.id,
              app.id,
              ShareScope.User,
            ),
          ).toBe(false)
        })
        it('allows invite', async () => {
          expect(
            await subject(
              PermissionAction.Invite,
              targetUser.id,
              app.id,
              ShareScope.User,
            ),
          ).toBe(true)
        })
        it('allows use', async () => {
          expect(
            await subject(
              PermissionAction.Use,
              targetUser.id,
              app.id,
              ShareScope.User,
            ),
          ).toBe(true)
        })
      })

      describe('when the user is invited to the app', () => {
        let targetUser: User
        beforeEach(async () => {
          targetUser = await UserFactory.create(prisma, {
            workspaceId: workspace.id,
          })

          const share = await prisma.share.findFirstOrThrow({
            where: {
              appId: app.id,
            },
          })

          await ShareTargetFactory.create(prisma, {
            sharerId: user.id,
            shareId: share.id,
            userId: targetUser.id,
            accessLevel: UserAccessLevel.Invite,
          })
        })
        it('allows update', async () => {
          expect(
            await subject(
              PermissionAction.Update,
              targetUser.id,
              app.id,
              ShareScope.User,
            ),
          ).toBe(false)
        })
        it('does not allow delete', async () => {
          expect(
            await subject(
              PermissionAction.Delete,
              targetUser.id,
              app.id,
              ShareScope.User,
            ),
          ).toBe(false)
        })
        it('allows invite', async () => {
          expect(
            await subject(
              PermissionAction.Invite,
              targetUser.id,
              app.id,
              ShareScope.User,
            ),
          ).toBe(true)
        })
        it('allows use', async () => {
          expect(
            await subject(
              PermissionAction.Use,
              targetUser.id,
              app.id,
              ShareScope.User,
            ),
          ).toBe(true)
        })
      })

      describe('when the user is a "user" of the app', () => {
        let targetUser: User
        beforeEach(async () => {
          targetUser = await UserFactory.create(prisma, {
            workspaceId: workspace.id,
          })

          const share = await prisma.share.findFirstOrThrow({
            where: {
              appId: app.id,
            },
          })

          await ShareTargetFactory.create(prisma, {
            sharerId: user.id,
            shareId: share.id,
            userId: targetUser.id,
            accessLevel: UserAccessLevel.Use,
          })
        })

        it('allows update', async () => {
          expect(
            await subject(
              PermissionAction.Update,
              targetUser.id,
              app.id,
              ShareScope.User,
            ),
          ).toBe(false)
        })
        it('does not allow delete', async () => {
          expect(
            await subject(
              PermissionAction.Delete,
              targetUser.id,
              app.id,
              ShareScope.User,
            ),
          ).toBe(false)
        })
        it('allows invite', async () => {
          expect(
            await subject(
              PermissionAction.Invite,
              targetUser.id,
              app.id,
              ShareScope.User,
            ),
          ).toBe(false)
        })
        it('allows use', async () => {
          expect(
            await subject(
              PermissionAction.Use,
              targetUser.id,
              app.id,
              ShareScope.User,
            ),
          ).toBe(true)
        })
      })

      describe('when the user is not related to the app', () => {
        let targetUser: User
        beforeEach(async () => {
          targetUser = await UserFactory.create(prisma, {
            workspaceId: workspace.id,
          })
        })
        it('does not allow update', async () => {
          expect(
            await subject(
              PermissionAction.Update,
              targetUser.id,
              app.id,
              ShareScope.User,
            ),
          ).toBe(false)
        })
        it('does not allow delete', async () => {
          expect(
            await subject(
              PermissionAction.Delete,
              targetUser.id,
              app.id,
              ShareScope.User,
            ),
          ).toBe(false)
        })
        it('does not allow invite', async () => {
          expect(
            await subject(
              PermissionAction.Invite,
              targetUser.id,
              app.id,
              ShareScope.User,
            ),
          ).toBe(false)
        })
        it('does not allow user', async () => {
          expect(
            await subject(
              PermissionAction.Use,
              targetUser.id,
              app.id,
              ShareScope.User,
            ),
          ).toBe(false)
        })
      })
    })

    describe('when the share scope is Private', () => {
      describe('when the user is author of the app', () => {
        it('allows update', async () => {
          expect(
            await subject(
              PermissionAction.Update,
              user.id,
              app.id,
              ShareScope.Private,
            ),
          ).toBe(true)
        })
        it('allows delete', async () => {
          expect(
            await subject(
              PermissionAction.Delete,
              user.id,
              app.id,
              ShareScope.Private,
            ),
          ).toBe(true)
        })
        it('allows invite', async () => {
          expect(
            await subject(
              PermissionAction.Invite,
              user.id,
              app.id,
              ShareScope.Private,
            ),
          ).toBe(true)
        })
        it('allows use', async () => {
          expect(
            await subject(
              PermissionAction.Use,
              user.id,
              app.id,
              ShareScope.Private,
            ),
          ).toBe(true)
        })
      })

      describe('when the user is NOT author of the app', () => {
        beforeEach(async () => {
          user = await UserFactory.create(prisma, {
            workspaceId: workspace.id,
          })
        })
        it('does not allow update', async () => {
          expect(
            await subject(
              PermissionAction.Update,
              user.id,
              app.id,
              ShareScope.Private,
            ),
          ).toBe(false)
        })
        it('does not allow delete', async () => {
          expect(
            await subject(
              PermissionAction.Delete,
              user.id,
              app.id,
              ShareScope.Private,
            ),
          ).toBe(false)
        })
        it('does not allow invite', async () => {
          expect(
            await subject(
              PermissionAction.Invite,
              user.id,
              app.id,
              ShareScope.Private,
            ),
          ).toBe(false)
        })
        it('does not allow use', async () => {
          expect(
            await subject(
              PermissionAction.Use,
              user.id,
              app.id,
              ShareScope.Private,
            ),
          ).toBe(false)
        })
      })
    })
    describe('when the share scope is Everybody', () => {
      describe('when the user is author of the app', () => {
        it('allows update', async () => {
          expect(
            await subject(
              PermissionAction.Update,
              user.id,
              app.id,
              ShareScope.Everybody,
            ),
          ).toBe(true)
        })
        it('allows delete', async () => {
          expect(
            await subject(
              PermissionAction.Delete,
              user.id,
              app.id,
              ShareScope.Everybody,
            ),
          ).toBe(true)
        })
        it('allows invite', async () => {
          expect(
            await subject(
              PermissionAction.Invite,
              user.id,
              app.id,
              ShareScope.Everybody,
            ),
          ).toBe(true)
        })
        it('allows use', async () => {
          expect(
            await subject(
              PermissionAction.Use,
              user.id,
              app.id,
              ShareScope.Everybody,
            ),
          ).toBe(true)
        })
      })

      describe('when the user is NOT author of the app', () => {
        beforeEach(async () => {
          user = await UserFactory.create(prisma, {
            workspaceId: workspace.id,
          })
        })
        it('allows update', async () => {
          expect(
            await subject(
              PermissionAction.Update,
              user.id,
              app.id,
              ShareScope.Everybody,
            ),
          ).toBe(true)
        })
        it('allows delete', async () => {
          expect(
            await subject(
              PermissionAction.Delete,
              user.id,
              app.id,
              ShareScope.Everybody,
            ),
          ).toBe(false)
        })
        it('allows invite', async () => {
          expect(
            await subject(
              PermissionAction.Invite,
              user.id,
              app.id,
              ShareScope.Everybody,
            ),
          ).toBe(false)
        })
        it('allows use', async () => {
          expect(
            await subject(
              PermissionAction.Use,
              user.id,
              app.id,
              ShareScope.Everybody,
            ),
          ).toBe(true)
        })
      })
    })

    describe('when the user does not belong to the same workspace', () => {
      let targetUser: User
      beforeEach(async () => {
        workspace = await WorkspaceFactory.create(prisma)
        targetUser = await UserFactory.create(prisma, {
          workspaceId: workspace.id,
        })
      })
      it('throws an error', async () => {
        await expect(
          subject(
            PermissionAction.Update,
            targetUser.id,
            app.id,
            ShareScope.User,
          ),
        ).rejects.toThrow()
      })
    })
  })
})
