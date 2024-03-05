import { prisma } from '@/server/db'
import { getSortedPostsTree } from '@/server/posts/services/getSortedPostsTree.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
})

export const getPostsForSidebar = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    return await getSortedPostsTree(prisma, userId, input.workspaceId)
  })
