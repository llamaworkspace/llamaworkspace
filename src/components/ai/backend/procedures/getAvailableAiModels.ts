import { workspaceVisibilityFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import { aiRegistry } from '@/server/ai/aiRegistry'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
  providerSlug: z.string(),
})




 



  const zOutput = z.array(
           z.object({
    slug: z.string(),
    publicName: z.string(),
    isCustom: z.boolean(),
    fields: z.array(
      z.object({
        id: z.string(),
        slug: z.string(),
        publicName: z.string(),
        type: z.string(),
        isRequired: z.boolean(),
        min: z.number().nullable(),
        max: z.number().nullable(),
        value: z.string().nullable(),
      }),
    ),
  }),
)

export const getAvailableAiModels = protectedProcedure
  .input(zInput)
  .output(zOutput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    await ctx.prisma.workspace.findUniqueOrThrow({
      where: {
        id: input.workspaceId,
        ...workspaceVisibilityFilter(userId),
      },
    })

    const registry = aiRegistry.getProvider(input.providerSlug)
    const models = registry?.models ?? []

    const registryFinalModels = models.map((model) => {
      return { ...model, isCustom: false, fields: [] }
    })

    return registryFinalModels
  })
