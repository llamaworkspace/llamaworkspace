import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { protectedProcedure } from '@/server/trpc/trpc'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { z } from 'zod'
import { postEditionFilter } from '../postsBackendUtils'

const zUpdateInput = z.object({
  id: z.string(),
  title: z.optional(z.nullable(z.string())),
  emoji: z.optional(z.nullable(z.string())),
  hideEmptySettingsAlert: z.optional(z.boolean()),
})

export const postsUpdate = protectedProcedure
  .input(zUpdateInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const { id, ...data } = input

    await new PermissionsVerifier(ctx.prisma).callOrThrowTrpcError(
      PermissionAction.Update,
      userId,
      id,
    )

    await ctx.prisma.post.findFirstOrThrow({
      where: {
        id,
        isDefault: false, // Keep this to avoid updating the default post
        ...postEditionFilter(userId),
      },
    })

    return await ctx.prisma.post.update({
      where: {
        id,
      },
      data,
    })
  })
