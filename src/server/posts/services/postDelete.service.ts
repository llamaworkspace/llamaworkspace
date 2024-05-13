import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { Author } from '@/shared/aiTypesAndMappers'
import {
  ShareScope,
  UserAccessLevel,
  type PrismaClientOrTrxClient,
  type PrismaTrxClient,
} from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { scopePostByWorkspace } from '../postUtils'

interface PostDeleteServiceInputProps {
  postId: string
}

export const postDeleteService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  input: PostDeleteServiceInputProps,
) => {
  return await prismaAsTrx(prisma, async (prisma: PrismaTrxClient) => {
    const { userId, workspaceId } = uowContext
    const { postId } = input

    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Delete,
      userId,
      postId,
    )

    await prisma.post.findFirstOrThrow({
      where: scopePostByWorkspace(
        {
          id: postId,
          isDefault: false, // Keep this to avoid deleting the default post.
        },
        workspaceId,
      ),
    })

    return await prisma.post.delete({
      where: {
        id: postId,
      },
    })
  })
}

const createPost = async (
  prisma: PrismaTrxClient,
  workspaceId: string,
  userId: string,
  targetModel: string,
  input: PostDeleteServiceInputProps,
) => {
  return await prisma.post.create({
    data: {
      workspaceId,
      userId,
      ...input,
      postConfigVersions: {
        create: [
          {
            model: targetModel,
            messages: {
              create: [
                {
                  author: Author.System,
                },
              ],
            },
          },
        ],
      },
    },
  })
}

const createDefaultShare = async (
  prisma: PrismaTrxClient,
  postId: string,
  userId: string,
) => {
  return await prisma.share.create({
    data: {
      postId: postId,
      scope: ShareScope.User,
      shareTargets: {
        create: [
          {
            sharerId: userId,
            userId: userId,
            accessLevel: UserAccessLevel.Owner,
          },
        ],
      },
    },
  })
}
