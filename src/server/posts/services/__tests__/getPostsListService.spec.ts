import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PostConfigVersionFactory } from '@/server/testing/factories/PostConfigVersionFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { Post, PostConfigVersion, User, Workspace } from '@prisma/client'
import { getPostsListService } from '../getPostsList.service'

type PostWithLatestConfig = Post & { latestConfig: PostConfigVersion }

const subject = async (
  userId: string,
  workspaceId: string,
  includeLatestConfig?: boolean,
): Promise<Post[] | PostWithLatestConfig[]> => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  if (includeLatestConfig) {
    return await getPostsListService(prisma, context, {
      includeLatestConfig: true,
    })
  }
  return await getPostsListService(prisma, context)
}

describe('getPostsListService', () => {
  let workspace: Workspace
  let user: User
  let post1: Post
  let post2: Post

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    post1 = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })

    post2 = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })
  })

  it('returns the posts', async () => {
    const result = await subject(user.id, workspace.id)

    expect(result).toHaveLength(2)
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining(post1),
        expect.objectContaining(post2),
      ]),
    )
  })

  describe('when the latestPostConfig is requested', () => {
    let nextPostConfigForPost1: PostConfigVersion

    beforeEach(async () => {
      nextPostConfigForPost1 = await PostConfigVersionFactory.create(prisma, {
        postId: post1.id,
      })
    })
    it('returns the posts with the latest post config', async () => {
      const result = (await subject(
        user.id,
        workspace.id,
        true,
      )) as PostWithLatestConfig[]

      const post2ConfigVersion =
        await prisma.postConfigVersion.findFirstOrThrow({
          where: {
            postId: post2.id,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
      expect(result[0]!.latestConfig.id).toBe(nextPostConfigForPost1.id)
      expect(result[1]!.latestConfig.id).toBe(post2ConfigVersion.id)
      7
    })
  })
})
