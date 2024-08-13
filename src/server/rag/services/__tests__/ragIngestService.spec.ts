import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, User, Workspace } from '@prisma/client'
import { ragIngestService } from '../ragIngestService'

jest.mock('@/server/apps/services/createDefaultApp.service')

const subject = async (
  workspaceId: string,
  userId: string,
  payload: { assetId: string; filePath: string },
) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await ragIngestService(prisma, context, payload)
}

describe('ragIngestService', () => {
  let workspace: Workspace
  let user: User
  let app: App

  beforeEach(async () => {
    jest.clearAllMocks()

    workspace = await WorkspaceFactory.create(prisma)
    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })
    app = await AppFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })
  })

  it('generates embeddings', async () => {
    await subject(workspace.id, user.id, { assetId: 'fake', filePath: 'fake' })

    const embeddings = await prisma.assetEmbedding.findMany({
      where: {
        assetId: 'fake',
      },
    })

    expect(embeddings.length).toBeGreaterThan(0)
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(workspace.id, user.id, { assetId: 'fake', filePath: 'fake' })

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Update,
      expect.anything(),
      expect.anything(),
    )
  })

  describe('when asset already has embeddings', () => {
    xit('does nothing')
  })

  describe('when the format is not supported', () => {
    xit('throws')
  })

  describe('when the format is supported', () => {
    xit('and format is pdf, it calls PdfLoadingStrategy')
    xit('and format is md, it calls Whatever')
  })
})
