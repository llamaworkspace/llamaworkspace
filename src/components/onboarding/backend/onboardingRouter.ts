import { createTRPCRouter } from '@/server/trpc/trpc'
import { createOnboarding } from './procedures/createOnboarding'

export const onboardingRouter = createTRPCRouter({
  createOnboarding,
})
