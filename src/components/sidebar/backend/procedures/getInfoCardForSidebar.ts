import { workspaceEditionFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import { protectedProcedure } from '@/server/trpc/trpc'
import { SidebarInfoCardType } from '@/shared/globalTypes'
import type { PrismaClient, Workspace } from '@prisma/client'
import { Promise } from 'bluebird'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
})

export const getInfoCardForSidebar = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const workspace = await ctx.prisma.workspace.findFirst({
      where: {
        id: input.workspaceId,
        ...workspaceEditionFilter(userId),
      },
    })

    if (!workspace) {
      return null
    }

    if (await shouldShowInviteMembersCard(ctx.prisma, workspace)) {
      return {
        show: SidebarInfoCardType.Onboarding,
      }
    }

    return null
  })

const shouldShowInviteMembersCard = async (
  prisma: PrismaClient,
  workspace: Workspace,
) => {
  const numUsersPromise = prisma.usersOnWorkspaces.count({
    where: {
      workspaceId: workspace.id,
    },
  })

  const numChatsPromise = prisma.chat.count({
    where: {
      post: {
        workspaceId: workspace.id,
      },
    },
  })

  const [numUsers, numChats] = await Promise.all([
    numUsersPromise,
    numChatsPromise,
  ])

  if (numUsers < 2 && numChats <= 30) {
    return true
  }

  return false
}
