import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { protectedProcedure } from '@/server/trpc/trpc'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { z } from 'zod'

const zInput = z.object({
  postId: z.string(),
})

export const postsGetShares = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    // AcccessLevel .View is ok here because we're only checking if the user has access to the post
    // Incresing the level would fail because the frontend needs to always see the user's permissions
    await new PermissionsVerifier(ctx.prisma).callOrThrowTrpcError(
      PermissionAction.View,
      userId,
      input.postId,
    )

    return await ctx.prisma.postShare.findMany({
      where: {
        postId: input.postId,
      },
      include: {
        user: {
          select: {
            id: true,
            image: true,
            name: true,
            email: true,
          },
        },
        invite: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  })
