import { prisma } from '@/server/db'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { UserAccessLevel } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { Post, User, Workspace } from '@prisma/client'
import { PermissionsVerifier } from '../PermissionsVerifier'

describe('PermissionsVerifier ', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAccessLevelForPost', () => {
    const subject = async (
      action: PermissionAction,
      userId: string,
      postId: string,
    ) => {
      return await new PermissionsVerifier(prisma).getUserAccessLevelToPost(
        userId,
        postId,
      )
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

    it('when the user is owner', async () => {
      // when user is owner => Owner (for each access level, we test it)
      // when userId and postId are not related, return null / false
      const result = await subject(PermissionAction.Use, user.id, post.id)
      expect(result).toBe(UserAccessLevel.Owner)
    })
    // it('when the user is owner', async () => {
    //   // when user is owner => Owner (for each access level, we test it)
    //   // when userId and postId are not related, return null / false

    //   const result = await subject(PermissionAction.Use, user.id, post.id)
    //   expect(result).toBe(UserAccessLevel.Owner)

    //   const share = await prisma.share.findFirstOrThrow({
    //     where: {
    //       postId: post.id,
    //       scope: ShareScope.User,
    //     },
    //   })

    //   await Promise.map(Object.values(UserAccessLevel), async (accessLevel) => {
    //     const tempUser = await UserFactory.create(prisma, {
    //       workspaceId: workspace.id,
    //     })
    //     await ShareTargetFactory.create(prisma, {
    //       shareId: share.id,
    //       sharerId: user.id,
    //       userId: tempUser.id,
    //       accessLevel,
    //     })
    //     const result = await subject()
    //     expect(result).toBe(UserAccessLevel.Owner)
    //   })
    // })
  })

  // describe.skip('call', () => {
  //   const subject = async (
  //     action: PermissionAction,
  //     userId: string,
  //     postId: string,
  //   ) => {
  //     return await new PermissionsVerifier(mockDb).call(action, userId, postId)
  //   }

  //   beforeEach(() => {
  //     jest.clearAllMocks()
  //   })

  //   it.only('XXXXXXXXXXXX', async () => {
  //     const result = await subject(PermissionAction.Use, 'userId', 'postId')
  //     expect(result).toBeFalsy()
  //   })
  // })
})
