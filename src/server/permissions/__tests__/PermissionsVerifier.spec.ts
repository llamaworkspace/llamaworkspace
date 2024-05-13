import { prisma } from '@/server/db'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { UserAccessLevel } from '@/shared/globalTypes'
import type { Post, User, Workspace } from '@prisma/client'
import { PermissionsVerifier } from '../PermissionsVerifier'

describe('PermissionsVerifier ', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAccessLevelForPost', () => {
    const subject = async (userId: string, postId: string) => {
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
})
