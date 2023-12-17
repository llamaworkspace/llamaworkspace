import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { getPostConfigForChatIdService } from '@/server/posts/services/getPostConfigForChatId.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { z } from 'zod'
import { chatVisibilityFilter } from '../chatsBackendUtils'

const zGetById = z.object({
  chatId: z.string(),
})

export const getPostConfigForChatId = protectedProcedure
  .input(zGetById)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const chat = await ctx.prisma.chat.findFirstOrThrow({
      where: {
        id: input.chatId,
        ...chatVisibilityFilter(userId),
      },
    })

    await new PermissionsVerifier(ctx.prisma).callOrThrowTrpcError(
      PermissionAction.View,
      userId,
      chat.postId,
    )

    return await getPostConfigForChatIdService(prisma, input.chatId, userId)
  })
