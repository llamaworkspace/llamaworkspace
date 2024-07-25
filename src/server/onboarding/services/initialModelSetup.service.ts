import { upsertAiProviderService } from '@/server/ai/services/upsertProviderKVs.service'
import { type UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import {
  InitialModel,
  type PrismaClientOrTrxClient,
  type PrismaTrxClient,
} from '@/shared/globalTypes'

interface InitialModelSetupPayload {
  model: InitialModel
  apiKey: string
  openaiApiKey?: string
}

const OPENAI_MODEL = 'gpt-4o'
const LLAMA_MODEL = 'meta-llama/llama-3.1-405b-instruct'

export const initialModelSetupService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: InitialModelSetupPayload,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    // If the onboarding is completed: return

    // if openai:
    // - OK setup openai api key (update ai provider)
    // - OK setup default model for the workspace: OPENAI_MODEL
    // - setup default model for the user: OPENAI_MODEL
    // - setup default model for the fun facts teller: OPENAI_MODEL
    // if llama:
    // - OK setup openrouter.ai api key (update ai provider)
    // - idem openai

    const { workspaceId } = uowContext
    const { model, apiKey, openaiApiKey } = payload
    return await prismaAsTrx(prisma, async (prisma) => {
      await addAiProviders(prisma, workspaceId, payload)
      const defaultModel =
        model === InitialModel.Openai ? OPENAI_MODEL : LLAMA_MODEL
      await setDefaultWorkspaceModel(prisma, workspaceId, defaultModel)
      await markOnboardingAsCompleted(prisma, workspaceId)
    })
  })
}

const addAiProviders = async (
  prisma: PrismaTrxClient,
  workspaceId: string,
  payload: InitialModelSetupPayload,
) => {
  const { model, apiKey, openaiApiKey } = payload
  if (model === InitialModel.Openai) {
    await addAiProvider(prisma, workspaceId, 'openai', apiKey, OPENAI_MODEL)
  } else if (model === InitialModel.Llama) {
    if (!openaiApiKey) {
      throw new Error('openaiApiKey is required for Llama-based models')
    }

    await addAiProvider(
      prisma,
      workspaceId,
      'openai',
      openaiApiKey,
      OPENAI_MODEL,
    )

    await addAiProvider(
      prisma,
      workspaceId,
      'openrouter',
      openaiApiKey,
      LLAMA_MODEL,
    )
  } else {
    throw new Error(`Unknown model`)
  }
}

const setDefaultWorkspaceModel = async (
  prisma: PrismaTrxClient,
  workspaceId: string,
  defaultModel: string,
) => {
  return await prisma.workspace.update({
    where: {
      id: workspaceId,
    },
    data: {
      defaultModel,
    },
  })
}

const addAiProvider = async (
  prisma: PrismaTrxClient,
  workspaceId: string,
  providerSlug: string,
  apiKey: string,
  model: string,
) => {
  return await upsertAiProviderService(
    prisma,
    workspaceId,
    providerSlug,
    { apiKey },
    [{ slug: model, enabled: true }],
  )
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
