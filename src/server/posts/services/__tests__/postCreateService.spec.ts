import { AppGptEngine } from '@/components/posts/postsTypes'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { postCreateService } from '@/server/posts/services/postCreate.service'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { ShareScope, UserAccessLevel } from '@/shared/globalTypes'

const subject = async (workspaceId: string, userId: string) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  const input = { title: 'Test App' }
  return await postCreateService(prisma, uowContext, input)
}

describe('postCreateService', () => {
  it('creates a new post', async () => {
    const workspace = await WorkspaceFactory.create(prisma)
    const user = await UserFactory.create(prisma, { workspaceId: workspace.id })
    await subject(workspace.id, user.id)

    const app = await prisma.app.findFirstOrThrow({
      where: {
        userId: user.id,
      },
    })
    expect(app).toMatchObject({
      title: 'Test App',
      gptEngine: AppGptEngine.Basic,
    })
  })

  it('creates an Private-scope-based share for the post', async () => {
    const workspace = await WorkspaceFactory.create(prisma)
    const user = await UserFactory.create(prisma, { workspaceId: workspace.id })
    const app = await subject(workspace.id, user.id)

    const share = await prisma.share.findMany({
      where: {
        appId: app.id,
      },
    })
    expect(share).toHaveLength(1)
    expect(share).toMatchObject([
      {
        appId: app.id,
        scope: ShareScope.Private,
      },
    ])
  })

  it('creates a first appConfigVersion', async () => {
    const weirdModel = 'a_weird_model'
    const workspace = await WorkspaceFactory.create(prisma)
    const user = await UserFactory.create(prisma, {
      defaultModel: weirdModel,
      workspaceId: workspace.id,
    })

    const app = await subject(workspace.id, user.id)

    const appConfigVersion = await prisma.appConfigVersion.findFirstOrThrow({
      where: {
        appId: app.id,
      },
    })

    expect(appConfigVersion).toMatchObject({
      model: weirdModel,
    })
  })

  it('creates the default share', async () => {
    const workspace = await WorkspaceFactory.create(prisma)
    const user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    const app = await subject(workspace.id, user.id)

    const share = await prisma.share.findFirstOrThrow({
      where: {
        appId: app.id,
      },
      include: {
        shareTargets: true,
      },
    })

    expect(share).toMatchObject({
      appId: app.id,
      scope: ShareScope.Private,
      shareTargets: [
        expect.objectContaining({
          sharerId: user.id,
          userId: user.id,
          accessLevel: UserAccessLevel.Owner,
        }),
      ],
    })
  })
})
