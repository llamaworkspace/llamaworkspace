import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { ShareScope, type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import type { Post, PostConfigVersion, Prisma } from '@prisma/client'
import { omit, sortBy } from 'underscore'
import { scopePostByWorkspace } from '../postUtils'

interface GetPostsListServicePayload {
  includeLatestConfig?: boolean
}

// Overload signatures
export function getPostsListService(
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: { includeLatestConfig: true },
): Promise<(Post & { latestConfig: PostConfigVersion })[]>

export function getPostsListService(
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload?: { includeLatestConfig?: false },
): Promise<Post[]>

export async function getPostsListService(
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload?: GetPostsListServicePayload,
) {
  const { includeLatestConfig } = payload ?? {}

  const whereClauseForPrivateScope = {
    userId: uowContext.userId,
    shares: {
      some: {
        scope: ShareScope.Private,
      },
    },
  }

  const whereClauseForUserScope = {
    shares: {
      some: {
        scope: ShareScope.User,
        shareTargets: {
          some: {
            userId: uowContext.userId,
          },
        },
      },
    },
  }

  const whereClauseForEverybodyScope = {
    shares: {
      some: {
        scope: ShareScope.Everybody,
      },
    },
  }

  const [postsWithScopePrivate, postsWithScopeUser, postsWithScopeEverybody] =
    await Promise.all([
      genericPostFetch(
        prisma,
        uowContext.workspaceId,
        whereClauseForPrivateScope,
        !!includeLatestConfig,
      ),
      await genericPostFetch(
        prisma,
        uowContext.workspaceId,
        whereClauseForUserScope,
        !!includeLatestConfig,
      ),
      await genericPostFetch(
        prisma,
        uowContext.workspaceId,
        whereClauseForEverybodyScope,
        !!includeLatestConfig,
      ),
    ])

  return sortBy(
    [
      ...postsWithScopePrivate,
      ...postsWithScopeUser,
      ...postsWithScopeEverybody,
    ],
    (post) => -post.createdAt,
  )
}

const genericPostFetch = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  whereClause: Prisma.PostWhereInput,
  includeLatestConfig: boolean,
) => {
  const where = scopePostByWorkspace(
    {
      isDefault: false,
      ...whereClause,
    },
    workspaceId,
  )

  if (includeLatestConfig) {
    const posts = await prisma.post.findMany({
      where,
      include: {
        postConfigVersions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    })

    return posts.map((post) => {
      return {
        ...post,
        ...omit(post, 'postConfigVersions'),
        latestConfig: post.postConfigVersions[0],
      }
    })
  }

  return await prisma.post.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
  })
}
