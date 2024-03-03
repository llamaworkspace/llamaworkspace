import type { RouterInputs } from '@/lib/api'
import { prisma } from '@/server/db'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { trpcContextSetupHelper } from '@/server/testing/trpcContextSetupHelper'
import { Author } from '@/shared/aiTypesAndMappers'
import { UserAccessLevel } from '@/shared/globalTypes'
import { faker } from '@faker-js/faker'

type SubjectPayload = RouterInputs['chats']['createMessage']

const subject = async (
  payloadOverrides?: Partial<SubjectPayload>,
  permissionLevel?: string,
) => {
  const workspace = await WorkspaceFactory.create(prisma)
  const user = await UserFactory.create(prisma, { workspaceId: workspace.id })
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
  const chat = await ChatFactory.create(prisma, {
    postId: post.id,
    authorId: user.id,
  })
  const messageContent = faker.lorem.sentence()

  const { caller } = trpcContextSetupHelper(prisma, user.id)

  const message = await caller.chats.createMessage({
    chatId: chat.id,
    message: messageContent,
    author: Author.User,
    ...payloadOverrides,
  })

  return { user, post, chat, message, messageContent }
}

describe('createMessage', () => {
  it('creates the message', async () => {
    const { chat, messageContent } = await subject()
    const message = await prisma.message.findFirstOrThrow({
      where: {
        chatId: chat.id,
      },
    })
    expect(message).toMatchObject({
      message: messageContent,
    })
  })

  describe('when the author is Assistant', () => {
    it('is created without a message', async () => {
      const { message } = await subject({
        author: Author.Assistant,
      })

      expect(message).toMatchObject({
        message: null,
        author: Author.Assistant,
      })
    })
  })

  describe.skip('permissions', () => {
    describe('when is View', () => {
      it('throws an error', async () => {
        await expect(subject(undefined, UserAccessLevel.View)).rejects.toThrow()
      })
    })

    describe('when is Use (or higher)', () => {
      it('does not throw an error', async () => {
        await expect(
          subject(undefined, UserAccessLevel.Use),
        ).resolves.not.toThrow()
      })
    })
  })
})
