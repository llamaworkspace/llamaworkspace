import { createTRPCRouter } from '@/server/trpc/trpc'
import { setupInitialModel } from './procedures/setUpInitialModel'

export const onboardingRouter = createTRPCRouter({
  setupInitialModel,
})
