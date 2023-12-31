import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { protectedProcedure } from '@/server/trpc/trpc'
import { Author } from '@/shared/aiTypesAndMappers'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { isUndefined, omit } from 'underscore'
import { z } from 'zod'
import { postEditionFilter } from '../postsBackendUtils'

const zUpdate = z.object({
  id: z.string(),
  initialMessage: z.string().nullish(),
  systemMessage: z.string().nullish(),
  model: z.string().optional(),
})

export const postsConfigUpdate = protectedProcedure
  .input(zUpdate)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const { id, systemMessage, ...payload } = input

    const postConfigVersion =
      await ctx.prisma.postConfigVersion.findFirstOrThrow({
        where: {
          id,
          post: {
            ...postEditionFilter(userId),
          },
        },
      })

    await new PermissionsVerifier(ctx.prisma).callOrThrowTrpcError(
      PermissionAction.Update,
      userId,
      postConfigVersion.postId,
    )

    let targetPostConfigVersion = postConfigVersion

    // If there are chats using the configversion, when we edit it, we create a new version
    // else we dont
    const chatsCount = await ctx.prisma.chat.count({
      where: {
        postConfigVersionId: postConfigVersion.id,
      },
    })

    if (chatsCount) {
      // Duplicate
      const messages = await ctx.prisma.message.findMany({
        where: {
          postConfigVersionId: postConfigVersion.id,
          author: Author.System,
        },
      })

      const payload = omit(postConfigVersion, 'id', 'createdAt', 'updatedAt')

      const nextMessages = messages.map((message) => {
        const { id, createdAt, updatedAt, postConfigVersionId, ...rest } =
          message
        return rest
      })

      targetPostConfigVersion = await ctx.prisma.postConfigVersion.create({
        data: {
          ...payload,
          messages: {
            create: nextMessages,
          },
        },
      })
    }

    const result = await ctx.prisma.postConfigVersion.update({
      where: {
        id: targetPostConfigVersion.id,
      },
      data: payload,
    })

    if (!isUndefined(systemMessage)) {
      const targetMessage = await ctx.prisma.message.findFirst({
        where: {
          postConfigVersionId: targetPostConfigVersion.id,
          author: Author.System,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      await ctx.prisma.message.update({
        where: {
          id: targetMessage?.id,
        },
        data: {
          message: systemMessage,
        },
      })
    }

    return result
  })
