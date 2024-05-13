import { prisma } from '@/server/db'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { ShareTargetFactory } from '@/server/testing/factories/ShareTargetFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { UserAccessLevel } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { Post, User, Workspace } from '@prisma/client'
import { PermissionsVerifier } from '../PermissionsVerifier'

describe('PermissionsVerifier ', () => {
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

  describe('getAccessLevelForPost', () => {
    const subject = async (userId: string, postId: string) => {
      return await new PermissionsVerifier(prisma).getUserAccessLevelToPost(
        userId,
        postId,
      )
    }

    it('it returns the userAccessLevel', async () => {
      expect(await subject(user.id, post.id)).toBe(UserAccessLevel.Owner)
    })

    describe('when there is no relation between the user and the post', () => {
      it('it returns null', async () => {
        const tempUser = await UserFactory.create(prisma, {
          workspaceId: workspace.id,
        })

        expect(await subject(tempUser.id, post.id)).toBeNull()
      })
    })

    describe('when there are multiple shareTargets for the same post', () => {
      it('it throws', async () => {
        const share = await prisma.share.findFirstOrThrow({
          where: {
            postId: post.id,
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

        await expect(subject(user.id, post.id)).rejects.toThrow(
          'Multiple share targets found for the same user and post',
        )
      })
    })
  })

  describe('call', () => {
    const subject = async (
      action: PermissionAction,
      userId: string,
      postId: string,
    ) => {
      return await new PermissionsVerifier(prisma).call(action, userId, postId)
    }

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

    describe('when the user is owner of the post', () => {
      it('allows update', async () => {
        expect(await subject(PermissionAction.Update, user.id, post.id)).toBe(
          true,
        )
      })
      it('allows delete', async () => {
        expect(await subject(PermissionAction.Delete, user.id, post.id)).toBe(
          true,
        )
      })
      it('allows invite', async () => {
        expect(await subject(PermissionAction.Invite, user.id, post.id)).toBe(
          true,
        )
      })
      it('allows user', async () => {
        expect(await subject(PermissionAction.Use, user.id, post.id)).toBe(true)
      })
    })

    describe('when the user is editor of the post', () => {
      let targetUser: User
      beforeEach(async () => {
        workspace = await WorkspaceFactory.create(prisma)

        targetUser = await UserFactory.create(prisma, {
          workspaceId: workspace.id,
        })

        const share = await prisma.share.findFirstOrThrow({
          where: {
            postId: post.id,
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
          await subject(PermissionAction.Update, targetUser.id, post.id),
        ).toBe(true)
      })
      it('does not allow delete', async () => {
        expect(
          await subject(PermissionAction.Delete, targetUser.id, post.id),
        ).toBe(false)
      })
      it('allows invite', async () => {
        expect(
          await subject(PermissionAction.Invite, targetUser.id, post.id),
        ).toBe(true)
      })
      it('allows user', async () => {
        expect(
          await subject(PermissionAction.Use, targetUser.id, post.id),
        ).toBe(true)
      })
    })

    describe('when the user is invited to the post', () => {
      let targetUser: User
      beforeEach(async () => {
        workspace = await WorkspaceFactory.create(prisma)

        targetUser = await UserFactory.create(prisma, {
          workspaceId: workspace.id,
        })

        const share = await prisma.share.findFirstOrThrow({
          where: {
            postId: post.id,
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
          await subject(PermissionAction.Update, targetUser.id, post.id),
        ).toBe(false)
      })
      it('does not allow delete', async () => {
        expect(
          await subject(PermissionAction.Delete, targetUser.id, post.id),
        ).toBe(false)
      })
      it('allows invite', async () => {
        expect(
          await subject(PermissionAction.Invite, targetUser.id, post.id),
        ).toBe(true)
      })
      it('allows user', async () => {
        expect(
          await subject(PermissionAction.Use, targetUser.id, post.id),
        ).toBe(true)
      })
    })

    describe('when the user is a "user" of the post', () => {
      let targetUser: User
      beforeEach(async () => {
        workspace = await WorkspaceFactory.create(prisma)

        targetUser = await UserFactory.create(prisma, {
          workspaceId: workspace.id,
        })

        const share = await prisma.share.findFirstOrThrow({
          where: {
            postId: post.id,
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
          await subject(PermissionAction.Update, targetUser.id, post.id),
        ).toBe(false)
      })
      it('does not allow delete', async () => {
        expect(
          await subject(PermissionAction.Delete, targetUser.id, post.id),
        ).toBe(false)
      })
      it('allows invite', async () => {
        expect(
          await subject(PermissionAction.Invite, targetUser.id, post.id),
        ).toBe(false)
      })
      it('allows user', async () => {
        expect(
          await subject(PermissionAction.Use, targetUser.id, post.id),
        ).toBe(true)
      })
    })

    describe('when the user is not related to the post', () => {
      let targetUser: User
      beforeEach(async () => {
        workspace = await WorkspaceFactory.create(prisma)

        targetUser = await UserFactory.create(prisma, {
          workspaceId: workspace.id,
        })
      })
      it('does not allow update', async () => {
        expect(
          await subject(PermissionAction.Update, targetUser.id, post.id),
        ).toBe(false)
      })
      it('does not allow delete', async () => {
        expect(
          await subject(PermissionAction.Delete, targetUser.id, post.id),
        ).toBe(false)
      })
      it('does not allow invite', async () => {
        expect(
          await subject(PermissionAction.Invite, targetUser.id, post.id),
        ).toBe(false)
      })
      it('does not allow user', async () => {
        expect(
          await subject(PermissionAction.Use, targetUser.id, post.id),
        ).toBe(false)
      })
    })
  })
})
