import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { protectedProcedure } from '@/server/trpc/trpc'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { z } from 'zod'
import { chatVisibilityFilter } from '../chatsBackendUtils'

const zInput = z.object({
  chatId: z.string(),
  model: z.string().optional(),
})

export const updatePostConfigForStandaloneChat = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const { chatId } = input

    const userId = ctx.session.user.id
    const chat = await ctx.prisma.chat.findFirstOrThrow({
      where: {
        id: chatId,
        ...chatVisibilityFilter(userId),
      },
    })

    await new PermissionsVerifier(ctx.prisma).callOrThrowTrpcError(
      PermissionAction.Use,
      userId,
      chat.postId,
    )

    await ctx.prisma.postConfigVersion.update({
      where: {
        id: chat.postConfigVersionId!,
      },
      data: {
        model: input.model,
      },
    })
  })
