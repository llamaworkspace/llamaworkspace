import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { workspaceWithUsersAndAppsFixture } from '@/server/testing/fixtures/workspaceWithUsersAndApps.fixture'
import { InitialModel } from '@/shared/globalTypes'
import type { App, User, Workspace } from '@prisma/client'
import { performInitialModelSetupService } from '../performInitialModelSetup.service'

const subject = async (
  workspaceId: string,
  userId: string,
  payload: {
    model: InitialModel
    apiKey: string
    openaiApiKey?: string
  },
) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await performInitialModelSetupService(prisma, uowContext, payload)
}

describe('performInitialModelSetupService', () => {
  let workspace: Workspace
  let user: User
  let app: App

  beforeEach(async () => {
    const fixture = await workspaceWithUsersAndAppsFixture(prisma)

    workspace = fixture.workspace
    user = fixture.user
    app = fixture.appWithScopeEverybody
  })

  it('marks the onboarding as completed', async () => {
    await subject(workspace.id, user.id, {
      model: InitialModel.Openai,
      apiKey: 'my-api-key',
    })

    const workspaceInDb = await prisma.workspace.findUnique({
      where: {
        id: workspace.id,
      },
    })

    expect(workspaceInDb!.onboardingCompletedAt).not.toBeNull()
  })

  describe('when the model is Openai', () => {
    it('sets an aiProvider for openai ', async () => {
      await subject(workspace.id, user.id, {
        model: InitialModel.Openai,
        apiKey: 'my-api-key',
      })

      const aiProviders = await prisma.aiProvider.findMany({
        where: {
          workspaceId: workspace.id,
        },
        include: {
          aiModels: true,
          keyValues: true,
        },
      })

      expect(aiProviders).toHaveLength(1)
      const aiProvider = aiProviders[0]!

      expect(aiProvider).toMatchObject({
        slug: 'openai',
      })

      const aiModels = aiProvider.aiModels

      expect(aiModels).toHaveLength(1)
      const aiModel = aiModels[0]!
      expect(aiModel).toMatchObject({
        slug: 'gpt-4o',
        isEnabled: true,
        aiProviderId: aiProvider.id,
      })

      const keyValues = aiProvider.keyValues

      expect(keyValues).toHaveLength(1)
      const keyValue = keyValues[0]!
      expect(keyValue).toMatchObject({
        key: 'apiKey',
        value: 'my-api-key',
        aiProviderId: aiProvider.id,
      })
    })

    it('sets the workspace default model to an openai one', async () => {
      await subject(workspace.id, user.id, {
        model: InitialModel.Openai,
        apiKey: 'my-api-key',
      })

      const workspaceInDb = await prisma.workspace.findUnique({
        where: {
          id: workspace.id,
        },
      })

      expect(workspaceInDb!.defaultModel).toBe('gpt-4o')
    })
  })

  describe('when the model is Llama', () => {
    it('sets an aiProvider for openai ', async () => {
      await subject(workspace.id, user.id, {
        model: InitialModel.Llama,
        apiKey: 'my-api-key',
        openaiApiKey: 'my-openai-api-key',
      })

      const aiProviders = await prisma.aiProvider.findMany({
        where: {
          workspaceId: workspace.id,
        },
        include: {
          aiModels: true,
          keyValues: true,
        },
      })

      expect(aiProviders).toHaveLength(2)
      const openaiProvider = aiProviders.find(
        (aiProvider) => aiProvider.slug === 'openai',
      )!

      expect(openaiProvider).toMatchObject({
        slug: 'openai',
      })

      const aiModels = openaiProvider.aiModels

      expect(aiModels).toHaveLength(1)
      const aiModel = aiModels[0]!
      expect(aiModel).toMatchObject({
        slug: 'gpt-4o',
        isEnabled: true,
        aiProviderId: openaiProvider.id,
      })

      const keyValues = openaiProvider.keyValues

      expect(keyValues).toHaveLength(1)
      const keyValue = keyValues[0]!
      expect(keyValue).toMatchObject({
        key: 'apiKey',
        value: 'my-openai-api-key',
        aiProviderId: openaiProvider.id,
      })
    })

    it('sets an aiProvider for openrouter', async () => {
      await subject(workspace.id, user.id, {
        model: InitialModel.Llama,
        apiKey: 'my-api-key',
        openaiApiKey: 'my-openai-api-key',
      })

      const aiProviders = await prisma.aiProvider.findMany({
        where: {
          workspaceId: workspace.id,
        },
        include: {
          aiModels: true,
          keyValues: true,
        },
      })

      expect(aiProviders).toHaveLength(2)
      const openrouterProvider = aiProviders.find(
        (aiProvider) => aiProvider.slug === 'openrouter',
      )!

      expect(openrouterProvider).toMatchObject({
        slug: 'openrouter',
      })

      const aiModels = openrouterProvider.aiModels

      expect(aiModels).toHaveLength(1)
      const aiModel = aiModels[0]!
      expect(aiModel).toMatchObject({
        slug: 'meta-llama/llama-3.1-405b-instruct',
        isEnabled: true,
        aiProviderId: openrouterProvider.id,
      })

      const keyValues = openrouterProvider.keyValues

      expect(keyValues).toHaveLength(1)
      const keyValue = keyValues[0]!
      expect(keyValue).toMatchObject({
        key: 'apiKey',
        value: 'my-openai-api-key',
        aiProviderId: openrouterProvider.id,
      })
    })

    it('sets the workspace default model to llama-based one', async () => {
      await subject(workspace.id, user.id, {
        model: InitialModel.Llama,
        apiKey: 'my-api-key',
        openaiApiKey: 'my-openai-api-key',
      })

      const workspaceInDb = await prisma.workspace.findUnique({
        where: {
          id: workspace.id,
        },
      })

      expect(workspaceInDb!.defaultModel).toBe(
        'meta-llama/llama-3.1-405b-instruct',
      )
    })
  })

  describe('when the onboarding is completed', () => {
    it.only('throws', async () => {
      await subject(workspace.id, user.id, {
        model: InitialModel.Openai,
        apiKey: 'my-api-key',
      })

      await expect(
        subject(workspace.id, user.id, {
          model: InitialModel.Openai,
          apiKey: 'my-api-key',
        }),
      ).rejects.toThrow()
      // expect()
    })
  })
})
