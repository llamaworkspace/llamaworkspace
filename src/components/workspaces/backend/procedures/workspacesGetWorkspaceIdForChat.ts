import { chatVisibilityFilter } from '@/components/chats/backend/chatsBackendUtils'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'
import { zodWorkspaceOutput } from '../workspacesBackendUtils'

const zInput = z.object({
  chatId: z.string(),
})

export const workspacesGetWorkspaceIdForChat = protectedProcedure
  .input(zInput)
  .output(zodWorkspaceOutput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const chat = await ctx.prisma.chat.findFirstOrThrow({
      select: {
        post: {
          select: {
            workspace: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      where: {
        id: input.chatId,
        ...chatVisibilityFilter(userId),
      },
    })

    const workspace = chat.post.workspace

    // Todo: Make workspaceId in post mandatory and remove this throw
    if (!workspace) {
      throw new Error(
        `Chat ${input.chatId} does not have a post with a connected workspaceId`,
      )
    }

    return workspace
  })
