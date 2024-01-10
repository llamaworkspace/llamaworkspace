import { upsertAiProvider } from '@/server/ai/services/upsertProvider.service'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'
import { workspaceEditionFilter } from '../workspacesBackendUtils'

const zInput = z.object({
  workspaceId: z.string(),
  openAiApiKey: z.string(),
})

export const workspacesUpdateForOnboarding = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const { workspaceId, openAiApiKey } = input

    await ctx.prisma.workspace.findFirstOrThrow({
      where: {
        id: workspaceId,
        ...workspaceEditionFilter(userId),
      },
    })

    await prismaAsTrx(ctx.prisma, async (prisma) => {
      await upsertAiProvider(prisma, workspaceId, 'openai', {
        apiKey: openAiApiKey,
      })
      await prisma.workspace.update({
        where: {
          id: input.workspaceId,
        },
        data: { isOnboardingCompleted: true },
      })
    })
  })
