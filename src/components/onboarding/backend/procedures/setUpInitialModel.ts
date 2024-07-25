import { initialModelSetupService } from '@/server/onboarding/services/initialModelSetup.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { InitialModel } from '@/shared/globalTypes'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
  model: z.nativeEnum(InitialModel),
})

export const setupInitialModel = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const { workspaceId, model } = input

    console.log('input', input)

    return await initialModelSetupService(ctx.prisma)
  })
