import { getEnumByValue } from '@/lib/utils'
import {
  UserAccessLevel,
  type PrismaClientOrTrxClient,
} from '@/shared/globalTypes'
import {
  canForAccessLevel,
  type PermissionAction,
} from '@/shared/permissions/permissionDefinitions'
import { TRPCError } from '@trpc/server'

export class PermissionsVerifier {
  constructor(private prisma: PrismaClientOrTrxClient) {}

  async call(action: PermissionAction, userId: string, postId: string) {
    const userAccessLevel = await this.getUserAccessLevelToPost(userId, postId)
    if (!userAccessLevel) {
      return false
    }

    return canForAccessLevel(action, userAccessLevel)
  }

  async callOrThrowTrpcError(
    action: PermissionAction,
    userId: string,
    postId: string,
  ) {
    const result = await this.call(action, userId, postId)

    if (!result) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have enough permissions to perform this action',
      })
    }
    return result
  }

  async getUserAccessLevelToPost(userId: string, postId: string) {
    const shareTargets = await this.prisma.shareTarget.findMany({
      where: {
        share: {
          postId,
        },
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Handle this case
    if (!shareTargets.length) {
      return null
    }

    // Handle this case
    if (shareTargets.length > 1) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Multiple share targets found for the same user and post',
      })
    }

    const shareTarget = shareTargets[0]!

    return getEnumByValue(UserAccessLevel, shareTarget.accessLevel)

    const postShare = await this.prisma.postShare.findFirst({
      where: {
        postId,
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (postShare) {
      return getEnumByValue(UserAccessLevel, postShare.accessLevel)
    }

    const workspaceWithPermission = await this.prisma.workspace.findFirst({
      select: {
        id: true,
      },
      where: {
        users: {
          some: {
            userId,
          },
        },
        posts: {
          some: {
            id: postId,
          },
        },
      },
    })

    if (!workspaceWithPermission) {
      return null
    }

    const workspaceOwner = await this.prisma.usersOnWorkspaces.findFirst({
      select: {
        userId: true,
      },
      where: {
        workspaceId: workspaceWithPermission.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return workspaceOwner?.userId === userId
      ? UserAccessLevel.Owner
      : UserAccessLevel.EditAndShare
  }
}
