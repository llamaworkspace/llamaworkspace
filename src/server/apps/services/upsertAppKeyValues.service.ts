import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import {
  KeyValueType,
  type PrismaClientOrTrxClient,
  type PrismaTrxClient,
  type SimplePrimitive,
} from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { KeyValue, Prisma } from '@prisma/client'
import Promise from 'bluebird'
import { isBoolean, isNull, isNumber } from 'underscore'
import { scopeAppByWorkspace } from '../appUtils'

type KeyValuePairs = Record<string, SimplePrimitive | null>

interface GetAppKeyValuesPayload {
  appId: string
  keyValuePairs: KeyValuePairs
}

export async function upsertAppKeyValuesService(
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: GetAppKeyValuesPayload,
) {
  const { userId, workspaceId } = uowContext
  const { appId, keyValuePairs } = payload

  await new PermissionsVerifier(prisma).passOrThrowTrpcError(
    PermissionAction.Use,
    userId,
    appId,
  )

  return await prismaAsTrx(prisma, async (prisma) => {
    const kvs = await prisma.keyValue.findMany({
      where: {
        appId,
        app: scopeAppByWorkspace({}, workspaceId),
      },
    })

    await Promise.all([
      await insertKeyValues(prisma, appId, kvs, keyValuePairs),
      await updateKeyValues(prisma, appId, kvs, keyValuePairs),
      await deleteKeyValues(prisma, appId, kvs, keyValuePairs),
    ])
  })
}

const insertKeyValues = async (
  prisma: PrismaTrxClient,
  appId: string,
  currentKVs: KeyValue[],
  keyValues: KeyValuePairs,
) => {
  const data = getInsertPayload(appId, currentKVs, keyValues)

  return await prisma.keyValue.createMany({
    data: data,
  })
}

const updateKeyValues = async (
  prisma: PrismaTrxClient,
  appId: string,
  currentKVs: KeyValue[],
  keyValues: KeyValuePairs,
) => {
  const payloads = getUpdatePayload(appId, currentKVs, keyValues)

  return await Promise.map(payloads, async ({ id, data }) => {
    return await prisma.keyValue.update({
      where: {
        id,
      },
      data,
    })
  })
}

const deleteKeyValues = async (
  prisma: PrismaTrxClient,
  appId: string,
  currentKVs: KeyValue[],
  keyValues: KeyValuePairs,
) => {
  const deletableKVIds = getDeletePayload(appId, currentKVs, keyValues)

  return await prisma.keyValue.deleteMany({
    where: {
      id: {
        in: deletableKVIds,
      },
    },
  })
}

const getInsertPayload = (
  appId: string,
  currentKVs: KeyValue[],
  keyValuePairs: KeyValuePairs,
) => {
  const result = [] as Prisma.KeyValueCreateManyInput[]

  for (const [key, value] of Object.entries(keyValuePairs)) {
    if (!isNull(value) && !currentKVs.find((kv) => kv.key === key)) {
      let type: KeyValueType = KeyValueType.String

      if (isNumber(value)) {
        type = KeyValueType.Number
      } else if (isBoolean(value)) {
        type = KeyValueType.Boolean
      }

      result.push({
        key,
        value: value.toString(),
        type,
        appId,
      })
    }
  }
  return result
}

interface GetUpdateResponseItem {
  id: string
  data: Prisma.KeyValueUpdateManyArgs['data']
}

const getUpdatePayload = (
  appId: string,
  currentKVs: KeyValue[],
  keyValuePairs: KeyValuePairs,
) => {
  const result: GetUpdateResponseItem[] = []

  for (const [key, value] of Object.entries(keyValuePairs)) {
    const currentKvEntity = currentKVs.find((kv) => kv.key === key)

    if (!isNull(value) && currentKvEntity) {
      let type: KeyValueType = KeyValueType.String

      if (isNumber(value)) {
        type = KeyValueType.Number
      } else if (isBoolean(value)) {
        type = KeyValueType.Boolean
      }

      const data = {
        key,
        value: value.toString(),
        type,
        appId,
      }
      result.push({ id: currentKvEntity.id, data })
    }
  }
  return result
}

const getDeletePayload = (
  appId: string,
  currentKVs: KeyValue[],
  keyValuePairs: KeyValuePairs,
) => {
  const result: string[] = []

  for (const [key, value] of Object.entries(keyValuePairs)) {
    const currentKvEntity = currentKVs.find((kv) => kv.key === key)

    if (currentKvEntity && isNull(value)) {
      result.push(currentKvEntity.id)
    }
  }
  return result
}
