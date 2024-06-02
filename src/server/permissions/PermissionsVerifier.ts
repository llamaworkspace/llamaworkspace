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

  async call(action: PermissionAction, userId: string, postId: string) {
    const scope = await this.getShareScope(postId)
    const app = await this.prisma.app.findFirstOrThrow({
      where: {
        id: postId,
      },
    })

    await this.userBelongsWorkspaceOrThrow(post.workspaceId, userId)
    // return await Promise.resolve(true)
    if (scope === ShareScope.Everybody) {
      return await this.handleEverybodyScope(userId, postId, action)
    }

    if (scope === ShareScope.Private) {
      return await this.handlePrivateScope(userId, postId)
    }

    if (scope === ShareScope.User) {
      return await this.handleUserScope(userId, postId, action)
    }

    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unknown share scope',
    })
  }

  async passOrThrowTrpcError(
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

  async getUserAccessLevelToPost(
    userId: string,
    postId: string,
  ): Promise<UserAccessLevel | null> {
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

    if (!shareTargets.length) {
      return null
    }

    if (shareTargets.length > 1) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Multiple share targets found for the same user and post',
      })
    }

    const shareTarget = shareTargets[0]!

    return getEnumByValue(UserAccessLevel, shareTarget.accessLevel)
  }

  private async getShareScope(postId: string) {
    const share = await this.prisma.share.findFirstOrThrow({
      where: {
        postId,
      },
    })

    return getEnumByValue(ShareScope, share.scope)
  }

  private async handleEverybodyScope(
    userId: string,
    postId: string,
    action: PermissionAction,
  ) {
    // If the userId is the owner of the post, then he can do anything
    // in other words: If they pass the handleUserScope test, then they can do anything

    const privateScopeResponse = await this.handlePrivateScope(userId, postId)
    if (privateScopeResponse) return true

    return canForAccessLevel(action, UserAccessLevel.EditWithoutInvite)
  }

  private async handlePrivateScope(userId: string, postId: string) {
    const app = await this.prisma.app.findFirstOrThrow({
      where: {
        id: postId,
      },
    })
    return post.userId === userId
  }

  private async handleUserScope(
    userId: string,
    postId: string,
    action: PermissionAction,
  ) {
    const userAccessLevel = await this.getUserAccessLevelToPost(userId, postId)
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
