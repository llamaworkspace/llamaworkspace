import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { protectedProcedure } from '@/server/trpc/trpc'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { chatEditionFilter } from '../chatsBackendUtils'

const zInput = z.object({
  id: z.string(),
  allowLastChatDeletion: z.optional(z.boolean()),
})

export const deleteChat = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const { id, allowLastChatDeletion } = input

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

    // Getting the first to avoid having to count
    const anotherChatInPost = await ctx.prisma.chat.findFirst({
      select: {
        id: true,
      },
      where: {
        postId: chat.postId,
        NOT: {
          id,
        },
      },
    })

    return await ctx.prisma.$transaction(async (prisma) => {
      if (!anotherChatInPost && !allowLastChatDeletion) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot delete the last chat of a post',
        })
      }

      return await prisma.chat.delete({
        where: {
          id: input.id,
        },
      })
    })
  })
