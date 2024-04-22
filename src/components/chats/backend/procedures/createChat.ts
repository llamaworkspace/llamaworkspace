import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
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

    return await prismaAsTrx(ctx.prisma, async (prisma) => {
      const chat = await prisma.chat.create({
        data: {
          ...input,
          authorId: userId,
        },
      })

      await prisma.postsOnUsers.upsert({
        where: {
          userId_postId: {
            postId: input.postId,
            userId,
          },
        },
        update: {
          lastVisitedAt: new Date(),
        },
        create: {
          postId: input.postId,
          userId,
          lastVisitedAt: new Date(),
        },
      })

      return chat
    })
  })
