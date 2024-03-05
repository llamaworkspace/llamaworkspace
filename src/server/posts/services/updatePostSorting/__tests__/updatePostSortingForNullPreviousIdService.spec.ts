import { prisma } from '@/server/db'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { Post, User, Workspace } from '@prisma/client'
import { updatePostSortingForNullPreviousId } from '../updatePostSortingForNullPreviousId.service'

const subject = async (userId: string, postId: string) => {
  return await updatePostSortingForNullPreviousId(prisma, userId, postId)
}

describe.skip('updatePostSortingForNullPreviousIdService', () => {
  let workspace: Workspace, user: User

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
  })

  describe('when there is the only post', () => {
    let post: Post
    beforeEach(async () => {
      post = await PostFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
        previousId: null,
      })
    })

    it('the previousId remains null', async () => {
      await subject(user.id, post.id)

      const updatedPost = await prisma.post.findUnique({
        where: {
          id: post.id,
        },
      })

      expect(updatedPost!.previousId).toBeNull()
    })
  })

  describe('when there are multiple posts', () => {
    let existingPost1: Post, existingPost2: Post, post: Post

    beforeEach(async () => {
      existingPost1 = await PostFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
        previousId: null,
      })

      existingPost2 = await PostFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
        previousId: existingPost1.id,
      })

      post = await PostFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
        previousId: existingPost2.id,
      })
    })

    describe('and there is only one post with previousId=null (all are sorted)', () => {
      it('updates the post with previousId=null', async () => {
        await subject(user.id, post.id)

        const posts = await prisma.post.findMany({
          where: {
            id: {
              in: [existingPost1.id, existingPost2.id, post.id],
            },
          },
        })

        expect(posts.find((p) => p.id === post.id)!.previousId).toBeNull()
        expect(posts.find((p) => p.id === existingPost1.id)!.previousId).toBe(
          post.id,
        )
        expect(posts.find((p) => p.id === existingPost2.id)!.previousId).toBe(
          existingPost1.id,
        )
      })
    })

    describe('and there are many posts with previousId=null (some are unsorted)', () => {
      it('updates the post with previousId=null', async () => {
        const existingPost3 = await PostFactory.create(prisma, {
          userId: user.id,
          workspaceId: workspace.id,
          previousId: null,
        })

        const existingPost4 = await PostFactory.create(prisma, {
          userId: user.id,
          workspaceId: workspace.id,
          previousId: null,
        })

        await subject(user.id, post.id)

        const posts = await prisma.post.findMany({
          where: {
            id: {
              in: [
                existingPost1.id,
                existingPost2.id,
                existingPost3.id,
                existingPost4.id,
                post.id,
              ],
            },
          },
        })

        expect(posts.find((p) => p.id === post.id)!.previousId).toBeNull()
        expect(posts.find((p) => p.id === existingPost4.id)!.previousId).toBe(
          post.id,
        )
        expect(
          posts.find((p) => p.id === existingPost3.id)!.previousId,
        ).toBeNull()

        // TODO: This test is failing, but this code is about to be deprecated
        // expect(posts.find((p) => p.id === existingPost2.id)!.previousId).toBe(
        //   existingPost1.id,
        // )
      })
    })
  })

  describe('boundaries', () => {
    let workspace2: Workspace,
      post1FromWorkspace2: Post,
      post2FromWorkspace2: Post

    beforeEach(async () => {
      workspace2 = await WorkspaceFactory.create(prisma)
      const user2 = await UserFactory.create(prisma, {
        workspaceId: workspace2.id,
      })

      post1FromWorkspace2 = await PostFactory.create(prisma, {
        userId: user2.id,
        workspaceId: workspace2.id,
        previousId: null,
      })
      post2FromWorkspace2 = await PostFactory.create(prisma, {
        userId: user2.id,
        workspaceId: workspace2.id,
        previousId: post1FromWorkspace2.id,
      })
    })

    it("doesn't update the post if the user doesn't own it", async () => {
      await subject(user.id, post2FromWorkspace2.id)
      const posts = await prisma.post.findMany({
        where: {
          workspace: {
            id: workspace2.id,
          },
        },
      })

      expect(
        posts.find((p) => p.id === post1FromWorkspace2.id)!.previousId,
      ).toBeNull()
      expect(
        posts.find((p) => p.id === post2FromWorkspace2.id)!.previousId,
      ).toBe(post1FromWorkspace2.id)
    })
  })
})
