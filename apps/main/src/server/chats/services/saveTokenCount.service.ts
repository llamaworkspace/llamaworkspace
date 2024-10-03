import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import type { ChatRun } from '@prisma/client'
import { scopeChatByWorkspace } from '../chatUtils'

interface SaveTokenCountForChatRunPayload {
  chatRunId: string
  requestTokens: number
  responseTokens: number
}

export const saveTokenCountService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: SaveTokenCountForChatRunPayload,
): Promise<ChatRun> => {
  const { userId, workspaceId } = uowContext
  const { chatRunId, requestTokens, responseTokens } = payload

  return await prismaAsTrx(prisma, async (prisma) => {
    await prisma.chatRun.findFirstOrThrow({
      where: {
        id: chatRunId,
        chat: scopeChatByWorkspace({ authorId: userId }, workspaceId),
      },
    })
    return await prisma.chatRun.update({
      where: { id: chatRunId },
      data: {
        requestTokens,
        responseTokens,
      },
    })
  })
}
