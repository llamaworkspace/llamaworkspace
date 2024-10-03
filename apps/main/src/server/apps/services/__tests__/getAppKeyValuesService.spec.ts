import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { KeyValueType } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, KeyValue, User, Workspace } from '@prisma/client'
import { getAppKeyValuesService } from '../getAppKeyValues.service'

const subject = async (userId: string, workspaceId: string, appId: string) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await getAppKeyValuesService(prisma, context, { appId })
}

describe('getAppKeyValuesService', () => {
  let workspace: Workspace
  let user: User
  let app: App
  let kv1AsString: KeyValue
  let kv2AsNumber: KeyValue
  let kv3AsBoolean: KeyValue

  beforeEach(async () => {
    workspace = await WorkspaceFactory.create(prisma)

    user = await UserFactory.create(prisma, {
      workspaceId: workspace.id,
    })

    app = await AppFactory.create(prisma, {
      userId: user.id,
      workspaceId: workspace.id,
    })

    kv1AsString = await prisma.keyValue.create({
      data: {
        key: 'key1',
        value: 'value1',
        appId: app.id,
        type: KeyValueType.String,
      },
    })

    kv2AsNumber = await prisma.keyValue.create({
      data: {
        key: 'key2',
        value: '2',
        appId: app.id,
        type: KeyValueType.Number,
      },
    })

    kv3AsBoolean = await prisma.keyValue.create({
      data: {
        key: 'key3',
        value: 'true',
        appId: app.id,
        type: KeyValueType.Boolean,
      },
    })
  })

  it('returns the raw kvs', async () => {
    const result = await subject(user.id, workspace.id, app.id)

    const { raw } = result

    expect(raw).toHaveLength(3)

    expect(raw[0]!).toEqual(kv1AsString)
    expect(raw[1]!).toEqual(kv2AsNumber)
    expect(raw[2]!).toEqual(kv3AsBoolean)
  })

  it('returns a kv data structure', async () => {
    const result = await subject(user.id, workspace.id, app.id)

    const { data } = result

    expect(Object.keys(data)).toHaveLength(3)

    expect(data[kv1AsString.key]).toEqual(kv1AsString.value)
    expect(data[kv2AsNumber.key]).toEqual(Number(kv2AsNumber.value))
    expect(data[kv3AsBoolean.key]).toEqual(Boolean(kv3AsBoolean.value))
  })

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(user.id, workspace.id, app.id)

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Use,
      expect.anything(),
      expect.anything(),
    )
  })
})
