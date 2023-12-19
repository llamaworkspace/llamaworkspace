import { chatVisibilityFilter } from '@/components/chats/backend/chatsBackendUtils'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { protectedProcedure } from '@/server/trpc/trpc'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { z } from 'zod'

const zInput = z.object({
  postId: z.string(),
})

export const getChatHistoryForSidebar = protectedProcedure
  .input(zInput)
  .query(async ({ input, ctx }) => {
    const userId = ctx.session.user.id
    const { postId } = input

    await new PermissionsVerifier(ctx.prisma).callOrThrowTrpcError(
      PermissionAction.View,
      userId,
      postId,
    )

    return await ctx.prisma.chat.findMany({
      select: {
        id: true,
        title: true,
      },
      where: {
        postId,
        ...chatVisibilityFilter(userId),
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  })
