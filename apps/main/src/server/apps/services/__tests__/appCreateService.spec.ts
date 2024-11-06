import { AppEngineType } from '@/components/apps/appsTypes'
import { appCreateService } from '@/server/apps/services/appCreate.service'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { ShareScope, UserAccessLevel } from '@/shared/globalTypes'
import type { User, Workspace } from '@prisma/client'

const subject = async (
  workspaceId: string,
  userId: string,
  payload?: { engineType?: AppEngineType },
) => {
  const uowContext = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  const input = {
    title: 'Test App',
    engineType: AppEngineType.Assistant,
    ...payload,
  }
  return await appCreateService(prisma, uowContext, input)
}

describe('appCreateService', () => {
  let workspace: Workspace
  let user: User
  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, { workspaceId: workspace.id })
  })

  it('creates a new app', async () => {
    await subject(workspace.id, user.id)

    const app = await prisma.app.findFirstOrThrow({
      where: {
        userId: user.id,
      },
    })
    expect(app).toMatchObject({
      title: 'Test App',
      engineType: AppEngineType.Assistant,
    })
  })

  it('creates an Private-scope-based share for the app', async () => {
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

  describe('when engineType is External', () => {
    it('creates an appKv named accessKey', async () => {
      const app = await subject(workspace.id, user.id, {
        engineType: AppEngineType.External,
      })

      const appKv = await prisma.keyValue.findMany({
        where: {
          appId: app.id,
        },
      })
      expect(appKv.length).toBe(1)
      expect(appKv[0]).toMatchObject({
        key: 'accessKey',
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
        value: expect.any(String),
      })
    })
  })
})
