import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { performInitialModelSetupService } from '@/server/onboarding/services/performInitialModelSetup.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { InitialModel } from '@/shared/globalTypes'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
  model: z.nativeEnum(InitialModel),
  apiKey: z.string(),
  openaiApiKey: z.string().optional(),
})

export const performInitialModelSetup = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    console.log(222222)
    const { workspaceId } = input
    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      workspaceId,
      userId,
    )

    return await performInitialModelSetupService(ctx.prisma, context, input)
  })
