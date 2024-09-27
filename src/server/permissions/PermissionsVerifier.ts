import { getEnumByValue } from '@/lib/utils'
import {
  ShareScope,
  UserAccessLevel,
  type PrismaClientOrTrxClient,
} from '@/shared/globalTypes'
import {
  canForAccessLevel,
  type PermissionAction,
} from '@/shared/permissions/permissionDefinitions'
import { TRPCError } from '@trpc/server'
import { createUserOnWorkspaceContext } from '../auth/userOnWorkspaceContext'

export class PermissionsVerifier {
  constructor(private prisma: PrismaClientOrTrxClient) {}

  async call(action: PermissionAction, userId: string, appId: string) {
    const scope = await this.getShareScope(appId)
    const app = await this.prisma.app.findFirstOrThrow({
      where: {
        id: appId,
        markAsDeletedAt: null,
      },
    })

    await this.userBelongsWorkspaceOrThrow(app.workspaceId, userId)

    if (scope === ShareScope.Everybody) {
      return await this.handleEverybodyScope(userId, appId, action)
    }

    if (scope === ShareScope.Private) {
      return await this.handlePrivateScope(userId, appId)
    }

    if (scope === ShareScope.User) {
      return await this.handleUserScope(userId, appId, action)
    }

    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unknown share scope',
    })
  }

  async passOrThrowTrpcError(
    action: PermissionAction,
    userId: string,
    appId: string,
  ) {
    const result = await this.call(action, userId, appId)

    if (!result) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have enough permissions to perform this action',
      })
    }
    return result
  }

  async getUserAccessLevelToApp(
    userId: string,
    appId: string,
  ): Promise<UserAccessLevel | null> {
    const shareTargets = await this.prisma.shareTarget.findMany({
      where: {
        share: {
          appId,
        },
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!shareTargets.length) {
      return null
    }

    // This is enforced at the database level, but just in case
    // db has a unique constraint on shareId and userId
    if (shareTargets.length > 1) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Multiple share targets found for the same user and app',
      })
    }

    const shareTarget = shareTargets[0]!

    return getEnumByValue(UserAccessLevel, shareTarget.accessLevel)
  }

  private async getShareScope(appId: string) {
    const share = await this.prisma.share.findFirstOrThrow({
      where: {
        appId,
      },
    })

    return getEnumByValue(ShareScope, share.scope)
  }

  private async handleEverybodyScope(
    userId: string,
    appId: string,
    action: PermissionAction,
  ) {
    // If the userId is the owner of the app, then he can do anything
    // in other words: If they pass the handleUserScope test, then they can do anything

    const privateScopeResponse = await this.handlePrivateScope(userId, appId)
    if (privateScopeResponse) return true

    return canForAccessLevel(action, UserAccessLevel.EditWithoutInvite)
  }

  private async handlePrivateScope(userId: string, appId: string) {
    const app = await this.prisma.app.findFirstOrThrow({
      where: {
        id: appId,
        markAsDeletedAt: null,
      },
    })
    return app.userId === userId
  }

  private async handleUserScope(
    userId: string,
    appId: string,
    action: PermissionAction,
  ) {
    const userAccessLevel = await this.getUserAccessLevelToApp(userId, appId)
    if (!userAccessLevel) {
      return false
    }

    return canForAccessLevel(action, userAccessLevel)
  }

  private async userBelongsWorkspaceOrThrow(
    workspaceId: string,
    userId: string,
  ) {
    await createUserOnWorkspaceContext(this.prisma, workspaceId, userId)
  }
}
