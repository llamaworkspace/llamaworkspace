import { aiRouter } from '@/components/ai/backend/aiRouter'
import { appsRouter } from '@/components/apps/backend/appsRouter'
import { assetsRouter } from '@/components/assets/backend/assetsRouter'
import { chatsRouter } from '@/components/chats/backend/chatsRouter'
import { onboardingRouter } from '@/components/onboarding/backend/onboardingRouter'
import { permissionsRouter } from '@/components/permissions/backend/permissionsRouter'
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
  apps: appsRouter,
  chats: chatsRouter,
  ai: aiRouter,
  permissions: permissionsRouter,
  assets: assetsRouter,
  onboarding: onboardingRouter,
})

// export type definition of API
export type RootRouter = typeof rootRouter
