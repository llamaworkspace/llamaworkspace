import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { MessageFactory } from '@/server/testing/factories/MessageFactory'
import { PostConfigVersionFactory } from '@/server/testing/factories/PostConfigVersionFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type {
  Chat,
  Message,
  Post,
  PostConfigVersion,
  User,
  Workspace,
} from '@prisma/client'
import { Promise } from 'bluebird'
import { getApplicablePostConfigToChatService } from '../getApplicablePostConfigToChat.service'

const subject = async (
  workspaceId: string,
  userId: string,
  payload: { chatId: string },
) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await getApplicablePostConfigToChatService(prisma, uowContext, payload)
}

describe('getApplicablePostConfigToChat', () => {
  let workspace: Workspace
  let user: User
  let post: Post
  let chat: Chat
  let messages: Message[]
  let otherPostConfigVersion: PostConfigVersion

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, { workspaceId: workspace.id })
    post = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })
    chat = await ChatFactory.create(prisma, {
      authorId: user.id,
      postId: post.id,
    })
    messages = await Promise.mapSeries(
      Array.from({ length: 3 }),
      async () =>
        await MessageFactory.create(prisma, {
          chatId: chat.id,
        }),
    )
    otherPostConfigVersion = await PostConfigVersionFactory.create(prisma, {
      postId: post.id,
    })
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )
    await subject(workspace.id, user.id, { chatId: chat.id })

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Use,
      expect.anything(),
      expect.anything(),
    )
  })

  describe('when the chat has a postConfigVersionId', () => {
    beforeEach(async () => {
      await prisma.chat.update({
        where: { id: chat.id },
        data: { postConfigVersionId: otherPostConfigVersion.id },
      })
    })

    it('returns the one linked to the chat', async () => {
      const result = await subject(workspace.id, user.id, { chatId: chat.id })
      expect(result.id).toEqual(otherPostConfigVersion.id)
    })

    it('returns the linked system messages', async () => {
      const result = await subject(workspace.id, user.id, { chatId: chat.id })

      const dbMessages = await prisma.message.findMany({
        where: {
          postConfigVersionId: otherPostConfigVersion.id,
        },
      })

      expect(dbMessages).toHaveLength(1)
      expect(result.messages[0]!.id).toBe(dbMessages[0]!.id)
    })
  })
  describe('when the chat does not have a postConfigVersionId', () => {
    it('returns the latest one created for the post', async () => {
      const result = await subject(workspace.id, user.id, {
        chatId: chat.id,
      })
      expect(result.id).toEqual(otherPostConfigVersion.id)
    })
  })
})
