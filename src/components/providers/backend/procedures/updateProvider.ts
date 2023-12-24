import { protectedProcedure } from '@/server/trpc/trpc'
import { Promise } from 'bluebird'
import { isNull } from 'underscore'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
  providerSlug: z.string(),
  values: z.record(z.string().optional().nullable()),
  // values: z.object({
  //   apiKey: z.string().optional().nullable(),
  //   baseUrl: z.string().optional().nullable(),
  // }),
})

export const updateProvider = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    // Boundaries!
    console.log(122, input, Object.entries(input.values))
    return await Promise.map(
      Object.entries(input.values),
      async ([key, value]) => {
        const aiProviderKeyValue =
          await ctx.prisma.aiProviderKeyValue.findFirst({
            where: {
              workspaceId: input.workspaceId,
              slug: input.providerSlug,
              key,
            },
          })

        if (isNull(value)) {
          if (aiProviderKeyValue) {
            await ctx.prisma.aiProviderKeyValue.delete({
              where: {
                id: aiProviderKeyValue.id,
              },
            })
          }
        } else {
          if (aiProviderKeyValue) {
            await ctx.prisma.aiProviderKeyValue.update({
              where: {
                id: aiProviderKeyValue.id,
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
        }
      },
    )
  })
