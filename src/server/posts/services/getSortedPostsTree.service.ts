import { EMPTY_POST_NAME } from '@/components/posts/postsConstants'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { sortBy } from 'underscore'
import { z } from 'zod'
import { scopePostByWorkspace } from '../postUtils'

const zSortedPosts = z.string().array()

export const getSortedPostsTreeService = async function (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
) {
  const { userId, workspaceId } = uowContext

  const [posts, postSorts] = await Promise.all([
    getPosts(prisma, userId, workspaceId),
    getPostSorts(prisma, userId, workspaceId),
  ])

  return getTree(posts, postSorts)
}

const getPosts = async (
  prisma: PrismaClientOrTrxClient,
  userId: string,
  workspaceId: string,
) => {
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      emoji: true,
      isDemo: true,
      chats: {
        select: {
          id: true,
        },
        where: {
          authorId: userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
    where: scopePostByWorkspace(
      {
        isDefault: false,
      },
      workspaceId,
    ),
    orderBy: {
      createdAt: 'desc',
    },
  })

  return posts.map(({ chats, ...post }) => {
    return { ...post, firstChatId: chats[0]?.id }
  })
}

const getPostSorts = async (
  prisma: PrismaClientOrTrxClient,
  userId: string,
  workspaceId: string,
) => {
  const postSort = await prisma.postSort.findFirst({
    select: {
      sortedPosts: true,
    },
    where: {
      userId,
      workspaceId, // Scoping happening here
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const parsedSortedPosts = zSortedPosts.safeParse(postSort?.sortedPosts)

  return parsedSortedPosts.success ? parsedSortedPosts.data : []
}

const getTree = (
  posts: Awaited<ReturnType<typeof getPosts>>,
  postSorts: Awaited<ReturnType<typeof getPostSorts>>,
) => {
  const sortedPostIdsSet = new Set(postSorts)

  const finalSortedPost = postSorts
    // TODO: This is dangerous, what if the post does not exist
    .map((postId) => posts.find((post) => post.id === postId)!)
    .filter((post) => !!post)

  const finalUnsortedPosts = posts.filter(
    (post) => !sortedPostIdsSet.has(post.id),
  )

  return [
    ...sortBy(finalUnsortedPosts, (post) => post.title ?? EMPTY_POST_NAME),
    ...finalSortedPost,
  ]
}
