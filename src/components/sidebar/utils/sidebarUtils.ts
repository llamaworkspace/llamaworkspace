import { EMPTY_POST_NAME } from '@/components/posts/postsConstants'
import type { RouterOutputs } from '@/lib/api'
import {
  eachMonthOfInterval,
  endOfDay,
  getYear,
  isSameYear,
  isToday,
  isWithinInterval,
  isYesterday,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns'
import { chain, sortBy } from 'underscore'

type PostsForSidebar = RouterOutputs['sidebar']['postsForSidebar']
type PostForSidebar = PostsForSidebar extends Array<infer Item> ? Item : never

type ChatHistoryForSidebarOutput =
  RouterOutputs['sidebar']['chatHistoryForSidebar']

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

// export enum ChatsGroupedByDateRanges {
//   Today = 'today',
//   Yesterday = 'yesterday',
//   Previous7Days = 'previous 7 days',
//   Previous30Days = 'previous 30 days',
//   Month = 'month',
//   Year = 'year',
// }

export const getChatsGroupedByDate = (chats: ChatHistoryForSidebarOutput) => {
  const today = new Date()
  return chain(chats)
    .groupBy((chat) => {
      const createdAt = chat.createdAt

      // Today
      if (isToday(createdAt)) return '1|Today'

      // Yesterday
      if (isYesterday(createdAt)) return '2|Yesterday'

      // Last 7 days
      if (
        isWithinInterval(createdAt, {
          start: startOfDay(subDays(today, 7)),
          end: endOfDay(today),
        })
      ) {
        return '3|Previous 7 days'
      }

      // Last 30 days
      if (
        isWithinInterval(createdAt, {
          start: startOfDay(subDays(today, 30)),
          end: endOfDay(today),
        })
      ) {
        return '4|Previous 30 days'
      }

      // Monthly buckets within the last year
      const startOfThisMonth = startOfMonth(today)
      if (
        isWithinInterval(createdAt, {
          start: subMonths(startOfThisMonth, 12),
          end: endOfDay(today),
        })
      ) {
        const months = eachMonthOfInterval({
          start: subMonths(startOfThisMonth, 11),
          end: today,
        }).reverse()

        let monthIndex = 10

        for (const month of months) {
          monthIndex++
          if (
            isSameYear(month, createdAt) &&
            createdAt.getMonth() === month.getMonth()
          ) {
            return `${monthIndex}|${createdAt.toLocaleString('default', { month: 'long' })}`
          }
        }
      }

      let yearIndex = 1000
      // Yearly buckets for anything older than past 12 months
      return `${'6'}|${getYear(createdAt).toString()}`
    })
    .map((group, key) => {
      return {
        key,
        group,
      }
    })
    .sortBy((group) => group.key.split('|')[0])
    .map((groupItem) => {
      return { label: groupItem.key.split('|')[1]!, chats: groupItem.group }
    })
    .value()
}
