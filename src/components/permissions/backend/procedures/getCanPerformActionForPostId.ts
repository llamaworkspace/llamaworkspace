import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { protectedProcedure } from '@/server/trpc/trpc'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { z } from 'zod'

const zInput = z.object({
  postId: z.string(),
  action: z.nativeEnum(PermissionAction),
})

export const getCanPerformActionForPostId = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const { postId, action } = input
    return await new PermissionsVerifier(ctx.prisma).call(
      action,
      userId,
      postId,
    )
  })
