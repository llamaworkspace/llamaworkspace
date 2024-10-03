import { createTRPCRouter } from '@/server/trpc/trpc'
import { performInitialModelSetup } from './procedures/performInitialModelSetup'

export const onboardingRouter = createTRPCRouter({
  performInitialModelSetup,
})
