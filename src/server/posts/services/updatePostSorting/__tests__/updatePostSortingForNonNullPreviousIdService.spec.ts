import { prisma } from '@/server/db'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { Post, User, Workspace } from '@prisma/client'
import { updatePostSortingForNonNullPreviousId } from '../updatePostSortingForNonNullPreviousId.service'

const subject = async (userId: string, postId: string, previousId: string) => {
  return await updatePostSortingForNonNullPreviousId(
    prisma,
    userId,
    postId,
    previousId,
  )
}

describe('updatePostSortingForNonNullPreviousId', () => {
  let workspace: Workspace, user: User

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
  })

  let post1: Post, post2: Post

  beforeEach(async () => {
    post1 = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
      previousId: null,
    })
    post2 = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
      previousId: post1.id,
    })
  })

  describe('when there are 2 posts', () => {
    it('correctly sets the previousIds', async () => {
      await subject(user.id, post1.id, post2.id)

      const posts = await prisma.post.findMany({
        where: {
          id: {
            in: [post1.id, post2.id],
          },
        },
      })

      expect(posts.find((p) => p.id === post1.id)!.previousId).toBe(post2.id)
      expect(posts.find((p) => p.id === post2.id)!.previousId).toBeNull()
    })
  })

  describe('when there are 3 posts', () => {
    let post3: Post

    beforeEach(async () => {
      post3 = await PostFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
        previousId: post2.id,
      })
    })

    describe('when moving the first post', () => {
      it('correctly sets the previousIds', async () => {
        await subject(user.id, post1.id, post2.id)

        const posts = await prisma.post.findMany({
          where: {
            id: {
              in: [post1.id, post2.id, post3.id],
            },
          },
        })

        expect(posts.find((p) => p.id === post1.id)!.previousId).toBe(post2.id)
        expect(posts.find((p) => p.id === post2.id)!.previousId).toBeNull()
        expect(posts.find((p) => p.id === post3.id)!.previousId).toBe(post1.id)
      })
    })

    describe('when moving a middle post not to the beginning', () => {
      it('correctly sets the previousIds', async () => {
        await subject(user.id, post2.id, post3.id)

        const posts = await prisma.post.findMany({
          where: {
            id: {
              in: [post1.id, post2.id, post3.id],
            },
          },
        })

        expect(posts.find((p) => p.id === post1.id)!.previousId).toBeNull()
        expect(posts.find((p) => p.id === post2.id)!.previousId).toBe(post3.id)
        expect(posts.find((p) => p.id === post3.id)!.previousId).toBe(post1.id)
      })
    })
  })

  describe('when there are 4 posts or more', () => {
    let post3: Post, post4: Post, post5: Post
    beforeEach(async () => {
      post3 = await PostFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
        previousId: post2.id,
      })
      post4 = await PostFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
        previousId: post3.id,
      })
      post5 = await PostFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
        previousId: post4.id,
      })
    })

    describe('when moving the first post to the second position', () => {
      it('resets the previousIds of the moved post and its siblings', async () => {
        await subject(user.id, post1.id, post2.id)

        const posts = await prisma.post.findMany({
          where: {
            id: {
              in: [post1.id, post2.id, post3.id, post4.id, post5.id],
            },
          },
        })

        expect(posts.find((p) => p.id === post1.id)!.previousId).toBe(post2.id)
        expect(posts.find((p) => p.id === post2.id)!.previousId).toBeNull()
        expect(posts.find((p) => p.id === post3.id)!.previousId).toBe(post1.id)
        expect(posts.find((p) => p.id === post4.id)!.previousId).toBe(post3.id)
        expect(posts.find((p) => p.id === post5.id)!.previousId).toBe(post4.id)
      })
    })
    describe('when moving the first post to the nth position', () => {
      it('resets the previousIds of the moved post and its siblings', async () => {
        await subject(user.id, post1.id, post3.id)

        const posts = await prisma.post.findMany({
          where: {
            id: {
              in: [post1.id, post2.id, post3.id, post4.id, post5.id],
            },
          },
        })

        expect(posts.find((p) => p.id === post1.id)!.previousId).toBe(post3.id)
        expect(posts.find((p) => p.id === post2.id)!.previousId).toBeNull()
        expect(posts.find((p) => p.id === post3.id)!.previousId).toBe(post2.id)
        expect(posts.find((p) => p.id === post4.id)!.previousId).toBe(post1.id)
        expect(posts.find((p) => p.id === post5.id)!.previousId).toBe(post4.id)
      })
    })
    describe('when moving a middle post not to the beginning', () => {
      it('resets the previousIds of the moved post and its siblings', async () => {
        await subject(user.id, post3.id, post1.id)

        const posts = await prisma.post.findMany({
          where: {
            id: {
              in: [post1.id, post2.id, post3.id, post4.id, post5.id],
            },
          },
        })

        expect(posts.find((p) => p.id === post1.id)!.previousId).toBeNull()
        expect(posts.find((p) => p.id === post2.id)!.previousId).toBe(post3.id)
        expect(posts.find((p) => p.id === post3.id)!.previousId).toBe(post1.id)
        expect(posts.find((p) => p.id === post4.id)!.previousId).toBe(post2.id)
        expect(posts.find((p) => p.id === post5.id)!.previousId).toBe(post4.id)
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
      await expect(
        subject(user.id, post1FromWorkspace2.id, post2FromWorkspace2.id),
      ).rejects.toThrow()

      const posts = await prisma.post.findMany({
        where: {
          workspace: {
            id: workspace2.id,
          },
        },
      })

      expect(posts.find((p) => p.id === post1FromWorkspace2.id)).toStrictEqual(
        post1FromWorkspace2,
      )
      expect(
        posts.find((p) => p.id === post2FromWorkspace2.id)!.previousId,
      ).toStrictEqual(post1FromWorkspace2.id)
    })
  })
})
