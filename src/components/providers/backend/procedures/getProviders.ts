import { aiRegistry } from '@/server/ai/aiRegistry'
import { getAiProvidersKVs } from '@/server/providers/services/getProvidersForWorkspace.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { pick } from 'underscore'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
})

export const getProviders = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const providersMeta = aiRegistry.getProvidersMeta()
    const aiProvidersKVBySlug = await getAiProvidersKVs(
      ctx.prisma,
      input.workspaceId,
      userId,
    )

    return providersMeta.map((providerMeta) => {
      const providerSlug = providerMeta.slug
      const providerFields = aiRegistry.getProvider(providerSlug).fields
      const fieldSlugs = providerFields.map((field) => field.slug)
      // Pick only Provider-registered fields
      const providerKV = pick(aiProvidersKVBySlug[providerSlug], ...fieldSlugs)

      return {
        ...providerMeta,
        fieldValues: providerKV ?? {},
      }
    })
  })
