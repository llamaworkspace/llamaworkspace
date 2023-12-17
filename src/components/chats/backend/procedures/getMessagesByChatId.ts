import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { protectedProcedure } from '@/server/trpc/trpc'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { z } from 'zod'
import { chatVisibilityFilter } from '../chatsBackendUtils'

const zInput = z.object({
  chatId: z.string(),
})

export const getMessagesByChatId = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const { chatId } = input
    const chat = await ctx.prisma.chat.findFirstOrThrow({
      where: {
        id: chatId,
        ...chatVisibilityFilter(userId),
      },
    })

    await new PermissionsVerifier(ctx.prisma).callOrThrowTrpcError(
      PermissionAction.View,
      userId,
      chat.postId,
    )

    return await ctx.prisma.message.findMany({
      where: {
        chatId,
        chat: {
          ...chatVisibilityFilter(userId),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  })
