import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { protectedProcedure } from '@/server/trpc/trpc'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { z } from 'zod'

const zInput = z.object({
  postId: z.string(),
})

export const createChat = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const { postId } = input

    const userId = ctx.session.user.id

    await new PermissionsVerifier(ctx.prisma).callOrThrowTrpcError(
      PermissionAction.Use,
      userId,
      postId,
    )

    return await ctx.prisma.chat.create({
      data: {
        ...input,
        authorId: userId,
      },
    })
  })
