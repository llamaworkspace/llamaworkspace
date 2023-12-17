import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { protectedProcedure } from '@/server/trpc/trpc'
import { Author } from '@/shared/aiTypesAndMappers'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { z } from 'zod'

const zInput = z.object({
  chatId: z.string(),
  message: z.optional(z.string()),
  author: z.nativeEnum(Author),
})
export const createMessage = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const { chatId, author } = input
    let { message } = input

    const userId = ctx.session.user.id

    const chat = await ctx.prisma.chat.findFirstOrThrow({
      where: {
        id: chatId,
        authorId: userId,
      },
    })

    await new PermissionsVerifier(ctx.prisma).callOrThrowTrpcError(
      PermissionAction.Use,
      userId,
      chat.postId,
    )

    if (author === Author.Assistant && message) {
      message = undefined
    }

    return await ctx.prisma.message.create({
      data: {
        chatId,
        message,
        author,
      },
    })
  })
