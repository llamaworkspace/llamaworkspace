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
        type: z.enum(['text', 'double', 'integer', 'boolean']),
        isRequired: z.boolean(),
        min: z.number().nullable(),
        max: z.number().nullable(),
        value: z.string().nullable(),
      }),
    ),
  }),
)

export const getAiModels = protectedProcedure
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

    const dbAiModels = await ctx.prisma.aiModel.findMany({
      include: {
        fields: true,
      },
      where: {
        provider: {
          slug: input.providerSlug,
          workspaceId: input.workspaceId,
        },
      },
    })

    const registry = aiRegistry.getProvider(input.providerSlug)

    const registryFinalModels = registry.models.map((model) => {
      return { ...model, isCustom: false, fields: [] }
    })

    const finalDbAiModels = dbAiModels.map((dbAiModel) => {
      const slug = `${input.providerSlug}/${dbAiModel.name
        .replaceAll(' ', '-')
        .toLocaleLowerCase()}`

      const fields = dbAiModel.fields.map((dbAiModelField) => {
        return {
          id: dbAiModelField.id,
          slug: dbAiModelField.slug,
          publicName: dbAiModelField.publicName,
          type: dbAiModelField.type,
          isRequired: dbAiModelField.isRequired,
          min: dbAiModelField.min,
          max: dbAiModelField.max,
          value: dbAiModelField.value,
        }
      })

      return {
        slug,
        publicName: dbAiModel.name,
        isCustom: true,
        fields,
      }
    })

    return [...registryFinalModels, ...finalDbAiModels]
  })
