import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { protectedProcedure } from '@/server/trpc/trpc'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { z } from 'zod'
import { postVisibilityFilter } from '../postsBackendUtils'

const zByIdInput = z.object({
  id: z.string(),
})

export const postsGetById = protectedProcedure
  .input(zByIdInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const postId = input.id

    await new PermissionsVerifier(ctx.prisma).passOrThrowTrpcError(
      PermissionAction.Use,
      userId,
      postId,
    )

    return await ctx.prisma.post.findFirstOrThrow({
      where: {
        id: postId,
        ...postVisibilityFilter(userId),
      },
      include: {
        chats: {
          select: { id: true, createdAt: true },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  })
