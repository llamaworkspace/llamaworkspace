import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { ChatFactory } from '@/server/testing/factories/ChatFactory'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { Chat, Post, User, Workspace } from '@prisma/client'
import { postConfigVersionUpdateForDefaultPostService } from '../postConfigVersionUpdateForDefaultPost.service'

interface SubjectPayload {
  model: string
}

const subject = async (
  workspaceId: string,
  userId: string,
  chatId: string,
  payload: SubjectPayload,
) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  return await postConfigVersionUpdateForDefaultPostService(
    prisma,
    uowContext,
    {
      chatId,
      model: payload.model,
    },
  )
}

describe('postConfigVersionUpdateForDefaultPostService', () => {
  let workspace: Workspace
  let user: User
  let post: Post
  let chat: Chat

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    post = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
      isDefault: true,
    })
    const postConfigVersion = await prisma.postConfigVersion.findFirstOrThrow({
      where: {
        postId: post.id,
      },
    })
    chat = await ChatFactory.create(prisma, {
      postId: post.id,
      authorId: user.id,
      postConfigVersionId: postConfigVersion.id,
    })
  })

  it('updates the postConfigVersion linked to the chat', async () => {
    await subject(workspace.id, user.id, chat.id, {
      model: 'fake_model',
    })
    const dbPostConfigVersion = await prisma.postConfigVersion.findMany({
      where: {
        postId: post.id,
        chats: {
          some: {
            id: chat.id,
          },
        },
      },
    })
    expect(dbPostConfigVersion.length).toBe(1)
    expect(dbPostConfigVersion[0]!.model).toBe('fake_model')
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(workspace.id, user.id, chat.id, {
      model: 'fake_model',
    })

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Use,
      expect.anything(),
      expect.anything(),
    )
  })

  describe('when the post linked to the chat is not the default post', () => {
    beforeEach(async () => {
      await prisma.post.update({
        where: { id: post.id },
        data: { isDefault: false },
      })
    })

    it('throws if it is not a default post', async () => {
      await expect(
        subject(workspace.id, user.id, chat.id, {
          model: 'fake_model',
        }),
      ).rejects.toThrow()
    })
  })
})
