import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'
import { AppFileStatus } from '../../postsTypes'

const zInput = z.object({
  appId: z.string(),
})

export const getAppFiles = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    return await ctx.prisma.appFile.findMany({
      where: {
        appId: input.appId,
        status: AppFileStatus.Success,
      },
    })

    // const userId = ctx.session.user.id
    // const post = await ctx.prisma.post.findFirstOrThrow({
    //   where: {
    //     id: input.postId,
    //   },
    // })

    // const context = await createUserOnWorkspaceContext(
    //   ctx.prisma,
    //   post.workspaceId,
    //   userId,
    // )

    // return await createFileUploadPresignedUrlService(ctx.prisma, context, input)
  })
