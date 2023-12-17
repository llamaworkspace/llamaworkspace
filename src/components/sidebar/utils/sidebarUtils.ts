import { EMPTY_POST_NAME } from '@/components/posts/postsConstants'
import type { RouterOutputs } from '@/lib/api'
import { sortBy } from 'underscore'

type PostsForSidebar = RouterOutputs['sidebar']['postsForSidebar']
type PostForSidebar = PostsForSidebar extends Array<infer Item> ? Item : never

export const getSortedPosts = (
  posts: PostsForSidebar,
  sortedPostIds: string[],
) => {
  const sortedPostIdsSet = new Set(sortedPostIds)

  const sortedPosts = sortedPostIds
    .map((postId) => posts.find((post) => post.id === postId))
    .filter((post): post is PostForSidebar => !!post)
  const unsortedPosts = posts.filter((post) => !sortedPostIdsSet.has(post.id))

  return [
    ...sortBy(unsortedPosts, (post) => post.title ?? EMPTY_POST_NAME),
    ...sortedPosts,
  ]
}
