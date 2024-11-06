import { EMPTY_APP_NAME } from '@/components/apps/appsConstants'
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

type appsForSidebar = RouterOutputs['sidebar']['appsForSidebar']
type AppForSidebar = appsForSidebar extends Array<infer Item> ? Item : never

type ChatHistoryForSidebarOutput =
  RouterOutputs['sidebar']['chatHistoryForSidebar']

export const getSortedApps = (apps: appsForSidebar, sortedAppIds: string[]) => {
  const sortedAppIdsSet = new Set(sortedAppIds)

  const sortedApps = sortedAppIds
    .map((appId) => apps.find((app) => app.id === appId))
    .filter((app): app is AppForSidebar => !!app)
  const unsortedApps = apps.filter((app) => !sortedAppIdsSet.has(app.id))

  return [
    ...sortBy(unsortedApps, (app) => app.title ?? EMPTY_APP_NAME),
    ...sortedApps,
  ]
}

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

        let monthIndex = 100

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

      // Yearly buckets for anything older than past 12 months
      return `${10000 - getYear(createdAt)}|${getYear(createdAt).toString()}`
    })
    .map((group, key) => {
      return {
        key,
        group,
      }
    })
    .sortBy((group) => Number(group.key.split('|')[0]))
    .map((groupItem) => {
      const chats = sortBy(groupItem.group, (chat) => !chat.createdAt)

      return { label: groupItem.key.split('|')[1]!, chats }
    })
    .value()
}
