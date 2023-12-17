import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { protectedProcedure } from '@/server/trpc/trpc'
import { UserAccessLevel } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

const zInput = z.object({
  shareId: z.string(),
  accessLevel: z.nativeEnum(UserAccessLevel).or(z.literal('remove')),
})

export const postsShareUpdateAccessLevel = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const { shareId, accessLevel } = input

    const share = await ctx.prisma.postShare.findFirstOrThrow({
      where: {
        id: shareId,
      },
    })

    await new PermissionsVerifier(ctx.prisma).callOrThrowTrpcError(
      PermissionAction.Share,
      userId,
      share.postId,
    )

    if (accessLevel === UserAccessLevel.Owner) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You cannot set the owner of a post share.',
      })
    }

    if (accessLevel === 'remove') {
      return ctx.prisma.$transaction(async (prisma) => {
        const result = await prisma.postShare.delete({
          where: {
            id: shareId,
          },
        })

        if (share.inviteId) {
          await prisma.invite.delete({
            where: {
              id: share.inviteId,
            },
          })
        }

        return result
      })
    }

    return await ctx.prisma.postShare.update({
      where: {
        id: shareId,
      },
      data: {
        accessLevel,
      },
    })
  })
