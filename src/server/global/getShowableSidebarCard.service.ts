import {
  SidebarInfoCardType,
  type PrismaClientOrTrxClient,
} from '@/shared/globalTypes'
import type { Workspace } from '@prisma/client'
import type { UserOnWorkspaceContext } from '../auth/userOnWorkspaceContext'
import { scopeChatByWorkspace } from '../chats/chatUtils'

export const getShowableSidebarCard = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
) => {
  const { workspaceId } = uowContext
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
    },
  })

  if (!workspace) {
    return null
  }

  if (await shouldShowInviteMembersCard(prisma, workspace)) {
    return {
      show: SidebarInfoCardType.Onboarding,
    }
  }

  return null
}

const shouldShowInviteMembersCard = async (
  prisma: PrismaClientOrTrxClient,
  workspace: Workspace,
) => {
  const numUsersPromise = prisma.usersOnWorkspaces.count({
    where: {
      workspaceId: workspace.id,
    },
  })

  const numChatsPromise = prisma.chat.count({
    where: scopeChatByWorkspace({}, workspace.id),
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
