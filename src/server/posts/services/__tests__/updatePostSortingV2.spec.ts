import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { Post, User, Workspace } from '@prisma/client'
import { updatePostSortingV2Service } from '../updatePostSortingV2.service'

const subject = async (workspaceId: string, userId: string, postId: string) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await updatePostSortingV2Service(prisma, uowContext, postId)
}

describe('updatePostSortingV2Service', () => {
  let workspace: Workspace
  let user: User
  let post1: Post

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    post1 = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })
  })

  describe('when it is the first post with position', () => {
    it('adds position 1', async () => {
      await subject(workspace.id, user.id, post1.id)
      const postOnUser = await prisma.postsOnUsers.findFirstOrThrow({
        where: {
          postId: post1.id,
        },
      })

      expect(postOnUser.position).toBe(1)
    })
  })

  describe('when it is the not the first post with position', () => {
    let post2: Post
    let post3: Post

    beforeEach(async () => {
      post2 = await PostFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
      post3 = await PostFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
    })

    it('adds position 1, moves position up for others', async () => {
      await subject(workspace.id, user.id, post2.id)
      await subject(workspace.id, user.id, post3.id)
      await subject(workspace.id, user.id, post1.id)

      const postOnUsers = await prisma.postsOnUsers.findMany({
        where: {
          userId: user.id,
        },
      })

      expect(postOnUsers.find((pou) => pou.postId === post1.id)?.position).toBe(
        1,
      )
      expect(postOnUsers.find((pou) => pou.postId === post2.id)?.position).toBe(
        3,
      )
      expect(postOnUsers.find((pou) => pou.postId === post3.id)?.position).toBe(
        2,
      )
    })
  })

  describe('there are six or more posts with position', () => {
    let post2: Post
    let post3: Post
    let post4: Post
    let post5: Post
    let post6: Post

    beforeEach(async () => {
      post2 = await PostFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
      post3 = await PostFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
      post4 = await PostFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
      post5 = await PostFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
      post6 = await PostFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
    })

    it('removes item previously in position 5', async () => {
      await subject(workspace.id, user.id, post6.id)
      await subject(workspace.id, user.id, post5.id)
      await subject(workspace.id, user.id, post4.id)
      await subject(workspace.id, user.id, post2.id)
      await subject(workspace.id, user.id, post3.id)
      await subject(workspace.id, user.id, post1.id)

      const postOnUsers = await prisma.postsOnUsers.findMany({
        where: {
          userId: user.id,
        },
      })

      expect(postOnUsers.find((pou) => pou.postId === post1.id)?.position).toBe(
        1,
      )
      expect(postOnUsers.find((pou) => pou.postId === post2.id)?.position).toBe(
        3,
      )
      expect(postOnUsers.find((pou) => pou.postId === post3.id)?.position).toBe(
        2,
      )
      expect(postOnUsers.find((pou) => pou.postId === post4.id)?.position).toBe(
        4,
      )
      expect(postOnUsers.find((pou) => pou.postId === post5.id)?.position).toBe(
        5,
      )
      expect(
        postOnUsers.find((pou) => pou.postId === post6.id)?.position,
      ).toBeNull()
    })
  })

  describe('when the post already has a position', () => {
    let post2: Post
    let post3: Post

    beforeEach(async () => {
      post2 = await PostFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
      })
    })

    it('does not update positions', async () => {
      await subject(workspace.id, user.id, post2.id)
      await subject(workspace.id, user.id, post1.id)

      const postOnUsers = await prisma.postsOnUsers.findMany({
        where: {
          userId: user.id,
        },
      })

      expect(postOnUsers.find((pou) => pou.postId === post1.id)?.position).toBe(
        1,
      )
      expect(postOnUsers.find((pou) => pou.postId === post2.id)?.position).toBe(
        2,
      )
      await subject(workspace.id, user.id, post2.id)

      const postOnUsers2 = await prisma.postsOnUsers.findMany({
        where: {
          userId: user.id,
        },
      })

      expect(
        postOnUsers2.find((pou) => pou.postId === post2.id)?.position,
      ).toBe(2)
    })
  })
})
