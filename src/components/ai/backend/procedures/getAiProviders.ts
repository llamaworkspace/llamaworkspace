import { maskValueWithBullets } from '@/lib/appUtils'
import { aiRegistry } from '@/server/ai/aiRegistry'
import { getAiProvidersKVs } from '@/server/ai/services/getProvidersForWorkspace.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import _ from 'underscore'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
})

export const getAiProviders = protectedProcedure
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
      const providerKV = _.chain(aiProvidersKVBySlug[providerSlug])
        .pick(...fieldSlugs)
        .mapObject(maskValueWithBullets)
        .value()

      return {
        ...providerMeta,
        values: providerKV ?? {},
      }
    })
  })
