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
    const userAccessLevel = await this.getAccessLevelForPost(postId, userId)
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

  async getAccessLevelForPost(postId: string, userId: string) {
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
