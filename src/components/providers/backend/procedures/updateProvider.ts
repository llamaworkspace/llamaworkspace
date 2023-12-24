import { protectedProcedure } from '@/server/trpc/trpc'
import { Promise } from 'bluebird'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
  providerSlug: z.string(),
  values: z.record(z.string()),
})

export const updateProvider = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    // Boundaries!
    console.log(122, Object.entries(input.values))
    return await Promise.map(
      Object.entries(input.values),
      async ([key, value]) => {
        const existing = await ctx.prisma.aiProviderKeyValue.findFirst({
          where: {
            workspaceId: input.workspaceId,
            slug: input.providerSlug,
            key,
          },
        })

        if (existing) {
          await ctx.prisma.aiProviderKeyValue.update({
            where: {
              id: existing.id,
            },
            data: {
              value,
            },
          })
        } else {
          await ctx.prisma.aiProviderKeyValue.create({
            data: {
              workspaceId: input.workspaceId,
              slug: input.providerSlug,
              key,
              value,
            },
          })
        }
      },
    )
  })
