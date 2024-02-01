import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { protectedProcedure } from '@/server/trpc/trpc'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { z } from 'zod'
import { chatEditionFilter } from '../chatsBackendUtils'

const zInput = z.object({
  id: z.string(),
  title: z.string(),
})

export const updateChatTitle = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const { id, title } = input

    const chat = await ctx.prisma.chat.findFirstOrThrow({
      where: {
        id,
        ...chatEditionFilter(userId),
      },
    })

    await new PermissionsVerifier(ctx.prisma).callOrThrowTrpcError(
      PermissionAction.Use,
      userId,
      chat.postId,
    )

    return await ctx.prisma.$transaction(async (prisma) => {
      return await prisma.chat.update({
        where: {
          id: input.id,
        },
        data: {
          title,
        },
      })
    })
  })
