import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { protectedProcedure } from '@/server/trpc/trpc'
import { Author, OpenAiModelEnum } from '@/shared/aiTypesAndMappers'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { z } from 'zod'

const zInput = z.object({
  postId: z.string(),
})

export const createStandaloneChat = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const { postId } = input

    const userId = ctx.session.user.id

    await new PermissionsVerifier(ctx.prisma).callOrThrowTrpcError(
      PermissionAction.Use,
      userId,
      postId,
    )

    return await ctx.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
      })

      const postConfigVersion = await prisma.postConfigVersion.create({
        data: {
          postId,
          model: user.defaultModel ?? OpenAiModelEnum.GPT3_5_TURBO,
          messages: {
            create: [
              {
                author: Author.System,
              },
            ],
          },
        },
      })

      return await prisma.chat.create({
        data: {
          ...input,
          authorId: userId,
          postConfigVersionId: postConfigVersion.id,
        },
      })
    })
  })
