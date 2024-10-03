import { scopeAppByWorkspace } from '@/server/apps/appUtils'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { getLatestWorkspaceForUserService } from '../../workspaces/services/getLatestWorkspaceForUser.service'

export const getEntrypointRedirectUrlService = async (
  prisma: PrismaClientOrTrxClient,
  userId: string,
) => {
  const workspace = await getLatestWorkspaceForUserService(prisma, userId)

  if (!workspace.onboardingCompletedAt) {
    return { url: `/w/${workspace.id}/onboarding` }
  }

  const chatRuns = await prisma.chatRun.count({
    where: {
      chat: {
        authorId: userId,
        app: {
          workspaceId: workspace.id,
        },
      },
    },
  })

  if (chatRuns) {
    return await handleCaseChatRunsExist(prisma, workspace.id, userId)
  }
  return await handleCaseNoChatRuns(prisma, workspace.id, userId)
}

const handleCaseChatRunsExist = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  userId: string,
) => {
  const latestPrivateChat = await prisma.chat.findFirst({
    where: {
      authorId: userId,
      app: scopeAppByWorkspace(
        {
          isDefault: true,
        },
        workspaceId,
      ),
    },
    include: {
      chatRuns: {
        select: { id: true },
        take: 1,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (!latestPrivateChat) {
    return { url: `/c/new?workspaceId=${workspaceId}` }
  }

  const latestPrivateChatHasRuns = !!latestPrivateChat.chatRuns.length

  if (latestPrivateChatHasRuns) {
    return { url: `/c/new?workspaceId=${workspaceId}` }
  }

  return { url: `/c/${latestPrivateChat.id}` }
}

const handleCaseNoChatRuns = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  userId: string,
) => {
  const demoChatbot = await prisma.app.findFirst({
    where: scopeAppByWorkspace(
      {
        isDemo: true,
        markAsDeletedAt: null,
      },
      workspaceId,
    ),
  })

  if (demoChatbot) {
    const canAccessDemoChatbot = await new PermissionsVerifier(prisma).call(
      PermissionAction.Use,
      userId,
      demoChatbot.id,
    )
    if (canAccessDemoChatbot) {
      return { url: `/p/${demoChatbot.id}` }
    }
  }

  return { url: `/c/new?workspaceId=${workspaceId}` }
}
