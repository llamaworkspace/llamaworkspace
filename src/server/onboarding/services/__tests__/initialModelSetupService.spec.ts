import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { workspaceWithUsersAndAppsFixture } from '@/server/testing/fixtures/workspaceWithUsersAndApps.fixture'
import { InitialModel } from '@/shared/globalTypes'
import { App, User, Workspace } from '@prisma/client'
import { initialModelSetupService } from '../initialModelSetup.service'

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
  return await initialModelSetupService(prisma, uowContext, payload)
}

describe('initialModelSetupService', () => {
  let workspace: Workspace
  let user: User
  let app: App

  beforeEach(async () => {
    const fixture = await workspaceWithUsersAndAppsFixture(prisma)

    workspace = fixture.workspace
    user = fixture.user
    app = fixture.appWithScopeEverybody
  })

  it.only('marks the onboarding as completed', async () => {
    await subject(workspace.id, user.id, {
      model: InitialModel.Openai,
      apiKey: 'api-key',
    })

    const workspaceInDb = await prisma.workspace.findUnique({
      where: {
        id: workspace.id,
      },
    })

    expect(workspaceInDb!.onboardingCompletedAt).not.toBeNull()
  })

  describe('when the model is Openai', () => {
    xit('sets the workspace default model', async () => {
      await subject(workspace.id, user.id, {
        model: InitialModel.Openai,
        apiKey: 'api-key',
      })

      const workspaceInDb = await prisma.workspace.findUnique({
        where: {
          id: workspace.id,
        },
      })

      expect(workspaceInDb!.defaultModel).not.toBeNull()
    })
  })

  // describe('when the model is Openai', () => {

  // })

  describe('when the onboarding is completed', () => {
    xit('does nothing', async () => {
      // Not to all things!!!
      // expect()
    })
  })
})
