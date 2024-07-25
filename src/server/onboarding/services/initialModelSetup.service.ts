import { type UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type {
  InitialModel,
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'

interface InitialModelSetupPayload {
  model: InitialModel
  apiKey: string
  openaiApiKey?: string
}

export const initialModelSetupService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: InitialModelSetupPayload,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    // If the onboarding is completed: return
    // We need a DB field for that. We'll need it to conditionally display the onboarding modal
    // in a trx,
    // if openai:
    // - setup openai api key (update ai provider)
    // - setup default model for the workspace: gpt-4o
    // - setup default model for the user: gpt-4o
    // - setup default model for the fun facts teller: gpt-4o
    // if llama:
    // - setup openrouter.ai api key (update ai provider)
    // - idem openai
    return await prismaAsTrx(prisma, async (prisma) => {
      await markOnboardingAsCompleted(prisma, uowContext.workspaceId)
    })
  })
}

const markOnboardingAsCompleted = async (
  prisma: PrismaTrxClient,
  workspaceId: string,
) => {
  return await prisma.workspace.update({
    where: {
      id: workspaceId,
    },
    data: {
      onboardingCompletedAt: new Date(),
    },
  })
}
