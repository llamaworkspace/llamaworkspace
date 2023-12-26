import { aiRouter } from '@/components/ai/backend/aiRouter'
import { chatsRouter } from '@/components/chats/backend/chatsRouter'
import { postsRouter } from '@/components/posts/backend/postsRouter'
import { sidebarRouter } from '@/components/sidebar/backend/sidebarRouter'
import { usersRouter } from '@/components/users/backend/usersRouter'
import { workspacesRouter } from '@/components/workspaces/backend/workspacesRouter'
import { createTRPCRouter } from '@/server/trpc/trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */

export const rootRouter = createTRPCRouter({
  sidebar: sidebarRouter,
  users: usersRouter,
  workspaces: workspacesRouter,
  posts: postsRouter,
  chats: chatsRouter,
  ai: aiRouter,
})

// export type definition of API
export type RootRouter = typeof rootRouter
