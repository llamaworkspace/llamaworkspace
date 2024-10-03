import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import {
  KeyValueType,
  type PrismaClientOrTrxClient,
} from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { KeyValue } from '@prisma/client'
import { scopeAppByWorkspace } from '../appUtils'

interface GetAppKeyValuesPayload {
  appId: string
}

export async function getAppKeyValuesService(
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: GetAppKeyValuesPayload,
) {
  const { userId, workspaceId } = uowContext
  const { appId } = payload

  await new PermissionsVerifier(prisma).passOrThrowTrpcError(
    PermissionAction.Use,
    userId,
    appId,
  )

  const kvs = await prisma.keyValue.findMany({
    where: {
      appId,
      app: scopeAppByWorkspace({}, workspaceId),
    },
  })

  const data = getKeyValuesToHashMap(kvs)
  return { raw: kvs, data }
}

const coercedValue = (keyValue: KeyValue) => {
  if (keyValue.type === KeyValueType.Number.toString()) {
    return Number(keyValue.value)
  }

  if (keyValue.type === KeyValueType.Boolean.toString()) {
    return keyValue.value === 'true'
  }

  return keyValue.value as KeyValueType
}

const getKeyValuesToHashMap = (keyValues: KeyValue[]) => {
  return keyValues.reduce((memo, keyValue) => {
    return {
      ...memo,
      [keyValue.key]: coercedValue(keyValue),
    }
  }, {}) as Record<string, KeyValueType>
}
