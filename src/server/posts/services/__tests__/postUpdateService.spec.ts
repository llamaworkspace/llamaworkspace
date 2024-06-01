import { AppGptEngine } from '@/components/posts/postsTypes'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, User, Workspace } from '@prisma/client'
import { postUpdateService } from '../postUpdate.service'

const subject = async (
  workspaceId: string,
  userId: string,
  postId: string,
  payload: {
    title?: string | null
    emoji?: string | null
    gptEngine?: AppGptEngine
  } = {},
) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  return await postUpdateService(prisma, uowContext, { ...payload, postId })
}

describe('postUpdateService', () => {
  let workspace: Workspace
  let user: User
  let post: App

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    post = await PostFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
      title: 'A title',
    })
  })

  it('updates the post', async () => {
    const postInDbBefore = await prisma.app.findFirstOrThrow({
      where: {
        id: post.id,
      },
    })
    expect(postInDbBefore.title).toBe('A title')

    await subject(workspace.id, user.id, post.id, { title: 'A new title' })

    const postInDb = await prisma.app.findFirstOrThrow({
      where: {
        id: post.id,
      },
    })

    expect(postInDb.title).toBe('A new title')
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(workspace.id, user.id, post.id, { title: 'A new title' })

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Update,
      expect.anything(),
      expect.anything(),
    )
  })

  describe('when the postId is the defaultPost for the workspace', () => {
    let defaultPost: App

    beforeEach(async () => {
      defaultPost = await PostFactory.create(prisma, {
        userId: user.id,
        workspaceId: workspace.id,
        isDefault: true,
      })
    })

    it('throws an error', async () => {
      await expect(
        subject(workspace.id, user.id, defaultPost.id),
      ).rejects.toThrow()
    })
  })

  describe('gptEngine updates', () => {
    describe('when gptEngine is not set', () => {
      it('updates the post', async () => {
        const postInDbBefore = await prisma.app.findFirstOrThrow({
          where: {
            id: post.id,
          },
        })
        expect(postInDbBefore.gptEngine).toBe(null)

        await subject(workspace.id, user.id, post.id, {
          gptEngine: AppGptEngine.OpenaiAssistant,
        })

        const postInDb = await prisma.app.findFirstOrThrow({
          where: {
            id: post.id,
          },
        })

        expect(postInDb.gptEngine).toBe(AppGptEngine.OpenaiAssistant)
      })
    })

    describe('when gptEngine is set', () => {
      beforeEach(async () => {
        await prisma.app.update({
          where: {
            id: post.id,
          },
          data: {
            gptEngine: AppGptEngine.OpenaiAssistant,
          },
        })
      })
      it('throws when trying to update it', async () => {
        await expect(
          subject(workspace.id, user.id, post.id, {
            gptEngine: AppGptEngine.OpenaiAssistant,
          }),
        ).rejects.toThrow('GPT Engine cannot be updated once set')
      })
    })
  })
})
