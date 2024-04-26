import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { Post, User, Workspace } from '@prisma/client'
import { getPostsListService } from '../getPostsList.service'

const subject = async (userId: string, workspaceId: string) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
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
})
