import { prisma } from '@/server/db'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { ChatRunFactory } from '@/server/testing/factories/ChatRunFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { Chat, Post, User, Workspace } from '@prisma/client'
import { getEntrypointRedirectUrlService } from '../getEntrypointRedirectUrl.service'

const subject = async (userId: string) => {
  return await getEntrypointRedirectUrlService(prisma, userId)
}
describe('getEntrypointRedirectUrl', () => {
  let workspace: Workspace
  let user: User
  let defaultPost: Post
  let demoChatbot: Post

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    defaultPost = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
      isDefault: true,
    })

    demoChatbot = await PostFactory.create(prisma, {
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
        postId: defaultPost.id,
        authorId: user.id,
        title: 'chat1',
      })

      chat2 = await ChatFactory.create(prisma, {
        postId: defaultPost.id,
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
        await prisma.post.delete({
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
})
