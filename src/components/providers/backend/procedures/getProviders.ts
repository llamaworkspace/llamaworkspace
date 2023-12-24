import { workspaceVisibilityFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import { aiRegistry } from '@/server/ai/aiRegistry'
import { protectedProcedure } from '@/server/trpc/trpc'
import { AiProviderKeyValue } from '@prisma/client'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
})

export const getProviders = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const workspace = await ctx.prisma.workspace.findFirst({
      where: {
        id: input.workspaceId,
        ...workspaceVisibilityFilter(userId),
      },
    })

    if (!workspace) {
      return null
    }

    const aiProviders = await ctx.prisma.aiProviderKeyValue.findMany({
      where: {
        workspaceId: workspace.id,
        workspace: {
          ...workspaceVisibilityFilter(userId),
        },
      },
    })
    if (!aiProviders.length) {
      await ctx.prisma.aiProviderKeyValue.create({
        data: {
          workspaceId: workspace.id,
          name: 'OpenAI',
          slug: 'openai',
          key: 'daKey',
          value: 'daValue',
        },
      })
    }
    // ...workspaceVisibilityFilter(userId),
    const providersMeta = aiRegistry.getProvidersMeta()

    const aiProviders2 = await ctx.prisma.aiProviderKeyValue.findMany({
      where: {
        workspaceId: workspace.id,
        workspace: {
          ...workspaceVisibilityFilter(userId),
        },
      },
    })

    const aiProvidersKVBySlug = aiProvidersDbPayloadToKeyValues(aiProviders2)

    return providersMeta.map((providerMeta) => {
      const providerSlug = providerMeta.slug
      const providerKV = aiProvidersKVBySlug[providerSlug]
      return {
        ...providerMeta,
        fieldValues: providerKV ?? {},
      }
    })
  })

const aiProvidersDbPayloadToKeyValues = (aiProviders: AiProviderKeyValue[]) => {
  const providers: Record<string, Record<string, string>> = {}

  aiProviders.forEach((aiProvider) => {
    if (!providers[aiProvider.slug]) {
      providers[aiProvider.slug] = {}
    }

    providers[aiProvider.slug]![aiProvider.key] = aiProvider.value
  })
  return providers
}
