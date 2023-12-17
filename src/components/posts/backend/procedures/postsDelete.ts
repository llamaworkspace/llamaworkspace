import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { protectedProcedure } from '@/server/trpc/trpc'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { z } from 'zod'
import { postEditionFilter } from '../postsBackendUtils'

const zInput = z.object({
  id: z.string(),
})

export const postsDelete = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const { id } = input

    await new PermissionsVerifier(ctx.prisma).callOrThrowTrpcError(
      PermissionAction.Delete,
      userId,
      id,
    )

    await ctx.prisma.post.findFirstOrThrow({
      where: {
        id,
        isDefault: false, // Keep this to avoid deleting the default post
        ...postEditionFilter(userId),
      },
    })

    return await ctx.prisma.post.delete({
      where: {
        id: input.id,
      },
    })
  })
