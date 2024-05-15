import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { getShowableSidebarCard } from '@/server/global/services/getShowableSidebarCard.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
})

export const deprecated_getInfoCardForSidebar = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const { workspaceId } = input

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      workspaceId,
      userId,
    )

    return await getShowableSidebarCard(ctx.prisma, context)
  })
