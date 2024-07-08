import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { AppFactory } from '@/server/testing/factories/AppFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { KeyValueType } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { App, KeyValue, User, Workspace } from '@prisma/client'
import { upsertAppKeyValuesService } from '../upsertAppKeyValues.service'

type KeyValueAllowedTypes = string | number | boolean

const subject = async (
  userId: string,
  workspaceId: string,
  appId: string,
  keyValuePairs: Record<string, KeyValueAllowedTypes | null>,
) => {
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )
  return await upsertAppKeyValuesService(prisma, context, {
    appId,
    keyValuePairs,
  })
}

describe('updateAppKeyValuesService', () => {
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

  it('calls PermissionsVerifier', async () => {
    const spy = jest.spyOn(
      PermissionsVerifier.prototype,
      'passOrThrowTrpcError',
    )

    await subject(user.id, workspace.id, app.id, { key4: 'pepe' })

    expect(spy).toHaveBeenCalledWith(
      PermissionAction.Use,
      expect.anything(),
      expect.anything(),
    )
  })

  describe('inserting key values', () => {
    it('inserts a string kv', async () => {
      const keyValues = { key4: 'pepe' }

      await subject(user.id, workspace.id, app.id, keyValues)
      const dbKvs = await prisma.keyValue.findMany({
        where: {
          appId: app.id,
        },
        orderBy: {
          key: 'asc',
        },
      })

      expect(dbKvs).toHaveLength(4)

      const insertedRow = dbKvs.find((kv) => kv.key === 'key4')

      expect(insertedRow).toEqual(
        expect.objectContaining({
          key: 'key4',
          value: 'pepe',
          type: KeyValueType.String,
        }),
      )
    })

    it('inserts a number kv', async () => {
      const keyValues = { key4: 1234 }

      await subject(user.id, workspace.id, app.id, keyValues)
      const dbKvs = await prisma.keyValue.findMany({
        where: {
          appId: app.id,
        },
        orderBy: {
          key: 'asc',
        },
      })

      expect(dbKvs).toHaveLength(4)

      const insertedRow = dbKvs.find((kv) => kv.key === 'key4')

      expect(insertedRow).toEqual(
        expect.objectContaining({
          key: 'key4',
          value: '1234',
          type: KeyValueType.Number,
        }),
      )
    })

    it('inserts a boolean kv', async () => {
      const keyValues = { key4: true }

      await subject(user.id, workspace.id, app.id, keyValues)
      const dbKvs = await prisma.keyValue.findMany({
        where: {
          appId: app.id,
        },
        orderBy: {
          key: 'asc',
        },
      })

      expect(dbKvs).toHaveLength(4)

      const insertedRow = dbKvs.find((kv) => kv.key === 'key4')

      expect(insertedRow).toEqual(
        expect.objectContaining({
          key: 'key4',
          value: 'true',
          type: KeyValueType.Boolean,
        }),
      )
    })
  })

  describe('updating key values', () => {
    it('updates a kv', async () => {
      const dbKvsBefore = await prisma.keyValue.findFirstOrThrow({
        where: {
          id: kv1AsString.id,
        },
      })

      expect(dbKvsBefore.type).toBe(KeyValueType.String)
      expect(dbKvsBefore.value).toBe('value1')

      await subject(user.id, workspace.id, app.id, { key1: 1234 })

      const dbKvs = await prisma.keyValue.findMany({
        where: {
          appId: app.id,
        },
        orderBy: {
          key: 'asc',
        },
      })

      expect(dbKvs).toHaveLength(3)
      const updatedKv = dbKvs.find((kv) => kv.key === 'key1')

      expect(updatedKv?.type).toEqual(KeyValueType.Number)
      expect(updatedKv?.value).toEqual('1234')
    })
  })

  describe('deleting key values', () => {
    it('deletes a kv', async () => {
      const dbKvsBefore = await prisma.keyValue.findFirstOrThrow({
        where: {
          id: kv1AsString.id,
        },
      })

      expect(dbKvsBefore.type).toBe(KeyValueType.String)
      expect(dbKvsBefore.value).toBe('value1')

      await subject(user.id, workspace.id, app.id, { key1: null, key3: null })

      const dbKvs = await prisma.keyValue.findMany({
        where: {
          appId: app.id,
        },
        orderBy: {
          key: 'asc',
        },
      })

      expect(dbKvs).toHaveLength(1)
      const deletedKv1 = dbKvs.find((kv) => kv.key === 'key1')
      expect(deletedKv1).toBeUndefined()
      const deletedKv3 = dbKvs.find((kv) => kv.key === 'key3')
      expect(deletedKv3).toBeUndefined()
    })
  })
})
