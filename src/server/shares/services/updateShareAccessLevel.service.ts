import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { WorkspaceInviteSources } from '@/server/workspaces/workspaceTypes'
import {
  UserAccessLevel,
  UserAccessLevelActions,
  type PrismaClientOrTrxClient,
  type PrismaTrxClient,
} from '@/shared/globalTypes'
import type { ShareTarget } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { scopeShareByWorkspace } from '../shareUtils'

interface UpdateShareAccessLevelPayload {
  shareTargetId: string
  accessLevel: UserAccessLevelActions
}

export const updateShareAccessLevelService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: UpdateShareAccessLevelPayload,
) => {
  const { workspaceId } = uowContext
  const { shareTargetId, accessLevel } = payload

  return await prismaAsTrx(prisma, async (prisma) => {
    // await new PermissionsVerifier(ctx.prisma).callOrThrowTrpcError(
    //   PermissionAction.Share,
    //   userId,
    //   share.postId,
    // )
    const shareTarget = await prisma.shareTarget.findFirstOrThrow({
      where: {
        id: shareTargetId,
        share: scopeShareByWorkspace({}, workspaceId),
      },
    })

    if (accessLevel === UserAccessLevelActions.Remove) {
      return await deleteShareAccessLevel(prisma, shareTarget)
    }

    return await updateShareAccessLevel(prisma, shareTargetId, accessLevel)
  })
}

const deleteShareAccessLevel = async (
  prisma: PrismaTrxClient,
  shareTarget: ShareTarget,
) => {
  // Share is linked to an invite
  if (shareTarget.workspaceInviteId) {
    const [workspaceInvite, countOfOtherSharesWithSameInvite] =
      await Promise.all([
        await prisma.workspaceInvite.findFirstOrThrow({
          where: {
            id: shareTarget.workspaceInviteId,
          },
        }),
        await prisma.shareTarget.count({
          where: {
            workspaceInviteId: shareTarget.workspaceInviteId,
            id: {
              not: shareTarget.id,
            },
          },
        }),
      ])

    if (workspaceInvite.source === WorkspaceInviteSources.Share.toString()) {
      if (countOfOtherSharesWithSameInvite === 0) {
        await prisma.workspaceInvite.delete({
          where: {
            id: shareTarget.workspaceInviteId,
          },
        })
        // Early return as the deletion above cascades to the share
        return
      }
    }
  }

  if (shareTarget.accessLevel === UserAccessLevel.Owner.toString()) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Owner cannot be removed',
    })
  }
  await prisma.shareTarget.delete({
    where: {
      id: shareTarget.id,
    },
  })
}

const updateShareAccessLevel = async (
  prisma: PrismaTrxClient,
  shareTargetId: string,
  accessLevel: UserAccessLevelActions,
) => {
  return await prisma.shareTarget.update({
    where: {
      id: shareTargetId,
    },
    data: {
      accessLevel,
    },
  })
}
