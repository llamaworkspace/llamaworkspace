import { prisma } from '@/server/db'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { ChatRunFactory } from '@/server/testing/factories/ChatRunFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import type { Chat, ChatRun, Post, User, Workspace } from '@prisma/client'
import { getEntrypointRedirectUrl } from '../getEntrypointRedirectUrl.service'

const subject = async (userId: string) => {
  return await getEntrypointRedirectUrl(prisma, userId)
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
    let chatRun: ChatRun

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

      chatRun = await ChatRunFactory.create(prisma, {
        chatId: chat1.id,
      })
    })

    describe('and the last chat has been run', () => {
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
    describe('and the last chat has not been run', () => {
      it('returns the url of the last chat', async () => {
        const { url } = await subject(user.id)
        expect(url).toEqual(`/c/${chat2.id}`)
      })
    })
  })

  describe('when there are no chats', () => {
    describe('when the default chatbot exists', () => {
      it.todo('it returns the url of the default chatbot')
    })
    describe('when the default chatbot does not exist', () => {
      describe('and the last chat has been run', () => {
        it.todo('returns the url of the last chat')
      })
      describe('and the last chat has not been run', () => {
        it.todo('it returns the url of a newly created chat')
      })
    })
    describe('when there are no chatbots', () => {
      describe('and the last chat has been run', () => {
        it.todo('returns the url of the last chat')
      })
      describe('and the last chat has not been run', () => {
        it.todo('it returns the url of a newly created chat')
      })
    })
  })
})
