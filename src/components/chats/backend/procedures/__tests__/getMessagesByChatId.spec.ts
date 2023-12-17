import type { RouterInputs } from '@/lib/api'
import { prisma } from '@/server/db'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { MessageFactory } from '@/server/testing/factories/MessageFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { rootRouter } from '@/server/trpc/rootRouter'
import { createInnerTRPCContext } from '@/server/trpc/trpc'
import { UserAccessLevel } from '@/shared/globalTypes'
import Promise from 'bluebird'
type SubjectPayload = RouterInputs['chats']['getMessagesByChatId']

const subject = async (
  payloadOverrides?: Partial<SubjectPayload>,
  permissionLevel?: string,
) => {
  const workspace = await WorkspaceFactory.create(prisma)
  const user = await UserFactory.create(prisma, { workspaceId: workspace.id })
  const otherUser = await UserFactory.create(prisma, {
    workspaceId: workspace.id,
  })
  const post = await PostFactory.create(
    prisma,
    { userId: user.id, workspaceId: workspace.id },
    permissionLevel
      ? {
          postShare: {
            accessLevel: permissionLevel,
          },
        }
      : undefined,
  )
  const otherPost = await PostFactory.create(prisma, {
    userId: otherUser.id,
    workspaceId: workspace.id,
  })
  const chat = await ChatFactory.create(prisma, {
    postId: post.id,
    authorId: user.id,
  })
  const otherChat = await ChatFactory.create(prisma, {
    postId: otherPost.id,
    authorId: user.id,
  })
  const messages = await Promise.mapSeries(
    Array.from({ length: 3 }),
    async () =>
      await MessageFactory.create(prisma, {
        chatId: chat.id,
      }),
  )
  await Promise.mapSeries(
    Array.from({ length: 3 }),
    async () =>
      await MessageFactory.create(prisma, {
        chatId: otherChat.id,
      }),
  )

  const session = {
    user: { id: user.id, name: user.name },
    expires: '1',
  }

  const ctx = createInnerTRPCContext({
    session,
  })
  const caller = rootRouter.createCaller({ ...ctx, prisma })
  const response = await caller.chats.getMessagesByChatId({
    chatId: chat.id,
    ...payloadOverrides,
  })

  return { user, post, chat, messages, response }
}

describe('getMessagesByChatId', () => {
  it('fetches the messages for a chat', async () => {
    const { chat } = await subject()
    const messages = await prisma.message.findMany({
      where: {
        chatId: chat.id,
      },
    })

    expect(messages.length).toEqual(3)
    expect(messages[0]!.chatId).toEqual(chat.id)
    expect(messages[1]!.chatId).toEqual(chat.id)
    expect(messages[2]!.chatId).toEqual(chat.id)
  })

  it('sorts them in descending order', async () => {
    const { response } = await subject()
    expect(response[0]!.createdAt > response[1]!.createdAt).toBe(true)
    expect(response[1]!.createdAt > response[2]!.createdAt).toBe(true)
  })

  describe('permissions', () => {
    describe('when is View (or higher)', () => {
      it('does not throw an error', async () => {
        await expect(
          subject(undefined, UserAccessLevel.View),
        ).resolves.not.toThrow()
      })
    })
  })
})
