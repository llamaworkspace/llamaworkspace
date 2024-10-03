import { prisma } from '@/server/db'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { ChatRunFactory } from '@/server/testing/factories/ChatRunFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { App, Chat, User, Workspace } from '@prisma/client'
import { getEntrypointRedirectUrlService } from '../getEntrypointRedirectUrl.service'

const subject = async (userId: string) => {
  return await getEntrypointRedirectUrlService(prisma, userId)
}
describe('getEntrypointRedirectUrl', () => {
  let workspace: Workspace
  let user: User
  let defaultApp: App
  let demoChatbot: App

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma, {
      onboardingCompletedAt: new Date(),
    })
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    defaultApp = await AppFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
      isDefault: true,
    })

    demoChatbot = await AppFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
      isDemo: true,
    })
  })

  describe('when there are chatRuns', () => {
    let chat1: Chat
    let chat2: Chat

    beforeEach(async () => {
      chat1 = await ChatFactory.create(prisma, {
        appId: defaultApp.id,
        authorId: user.id,
        title: 'chat1',
      })

      chat2 = await ChatFactory.create(prisma, {
        appId: defaultApp.id,
        authorId: user.id,
        title: 'chat2',
      })

      await ChatRunFactory.create(prisma, {
        chatId: chat1.id,
      })
    })

    describe('and the last private chat has been run', () => {
      beforeEach(async () => {
        await ChatRunFactory.create(prisma, {
          chatId: chat2.id,
        })
      })

      it('it returns the url to create a new chat', async () => {
        const { url } = await subject(user.id)
        expect(url).toEqual(`/c/new?workspaceId=${workspace.id}`)
      })
    })
    describe('and the last private chat has not been run', () => {
      it('returns the url of the last chat', async () => {
        const { url } = await subject(user.id)
        expect(url).toEqual(`/c/${chat2.id}`)
      })
    })
  })

  describe('when there are no chatRuns', () => {
    describe('when the demo chatbot exists', () => {
      it('it returns the url of the demo chatbot', async () => {
        const { url } = await subject(user.id)
        expect(url).toEqual(`/p/${demoChatbot.id}`)
      })
    })

    describe('when the demo chatbot does not exist', () => {
      beforeEach(async () => {
        await prisma.app.delete({
          where: {
            id: demoChatbot.id,
          },
        })
      })

      it('it returns the url to create a new chat', async () => {
        const { url } = await subject(user.id)
        expect(url).toEqual(`/c/new?workspaceId=${workspace.id}`)
      })
    })
  })

  describe('when there are no chats for the default app', () => {
    beforeEach(async () => {
      await prisma.chat.deleteMany({
        where: {
          appId: defaultApp.id,
        },
      })
    })

    describe('when the demo chatbot exists', () => {
      it('it returns the url of the demo chatbot', async () => {
        const { url } = await subject(user.id)
        expect(url).toEqual(`/p/${demoChatbot.id}`)
      })
    })

    describe('when the demo chatbot does not exist', () => {
      beforeEach(async () => {
        await prisma.app.delete({
          where: {
            id: demoChatbot.id,
          },
        })
      })

      it('it returns the url to create a new chat', async () => {
        const { url } = await subject(user.id)
        expect(url).toEqual(`/c/new?workspaceId=${workspace.id}`)
      })
    })

    // Handling edge case that is risky to fail via chages on code
    describe('and there are chats on chatbots', () => {
      beforeEach(async () => {
        const otherApp = await AppFactory.create(prisma, {
          userId: user.id,
          workspaceId: workspace.id,
        })
        const otherChat = await ChatFactory.create(prisma, {
          appId: otherApp.id,
          authorId: user.id,
        })
        await ChatRunFactory.create(prisma, {
          chatId: otherChat.id,
        })
      })

      it('returns the url of the demo chatbot', async () => {
        const { url } = await subject(user.id)
        expect(url).toEqual(`/c/new?workspaceId=${workspace.id}`)
      })
    })
  })

  describe('when the onboarding is not completed', () => {
    beforeEach(async () => {
      await prisma.workspace.update({
        where: {
          id: workspace.id,
        },
        data: {
          onboardingCompletedAt: null,
        },
      })
    })

    it('it returns the url of the onboarding page', async () => {
      const { url } = await subject(user.id)
      expect(url).toEqual(`/w/${workspace.id}/onboarding`)
    })
  })
})
