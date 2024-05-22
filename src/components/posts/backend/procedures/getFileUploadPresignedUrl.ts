import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { createFileUploadPresignedUrlService } from '@/server/files/services/createFileUploadPresignedUrl.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  postId: z.string(),
  fileName: z.string(),
})

export const createFileUploadPresignedUrl = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const post = await ctx.prisma.post.findFirstOrThrow({
      where: {
        id: input.postId,
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      post.workspaceId,
      userId,
    )

    return await createFileUploadPresignedUrlService(ctx.prisma, context, input)
  })
