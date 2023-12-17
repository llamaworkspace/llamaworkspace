import { EMPTY_POST_NAME } from '@/components/posts/postsConstants'
import { workspaceVisibilityFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { sortBy } from 'underscore'
import { z } from 'zod'

const zSortedPosts = z.string().array()

export const getSortedPostsTree = async function (
  prisma: PrismaClientOrTrxClient,
  userId: string,
  workspaceId: string,
) {
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
    where: {
      isDefault: false,
      workspaceId,
      workspace: {
        ...workspaceVisibilityFilter(userId),
      },
    },
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
      workspaceId,
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
