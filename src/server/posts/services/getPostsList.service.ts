import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import type { Post, PostConfigVersion } from '@prisma/client'
import { omit } from 'underscore'
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

  if (includeLatestConfig) {
    const posts = await prisma.post.findMany({
      where: scopePostByWorkspace(
        {
          isDefault: false,
        },
        uowContext.workspaceId,
      ),
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
        latestConfig: includeLatestConfig
          ? post.postConfigVersions[0]
          : undefined,
      }
    })
  }

  return await prisma.post.findMany({
    where: scopePostByWorkspace(
      {
        isDefault: false,
      },
      uowContext.workspaceId,
    ),
  })
}
