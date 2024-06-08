import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import {
  KeyValueType,
  type PrismaClientOrTrxClient,
} from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { KeyValue } from '@prisma/client'
import { scopeAppByWorkspace } from '../appUtils'

interface GetAppKeyValuesPayload {
  appId: string
}

type KeyValueString = Omit<KeyValue, 'type' & 'value'> & {
  type: KeyValueType.String
  value: string
}

type KeyValueNumber = Omit<KeyValue, 'type' & 'value'> & {
  type: KeyValueType.Number
  value: number
}

type KeyValueBoolean = Omit<KeyValue, 'type' & 'value'> & {
  type: KeyValueType.Boolean
  value: number
}

export type ParsedKeyValue = KeyValueString | KeyValueNumber | KeyValueBoolean

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

  return kvs.map((kv) => {
    if (kv.type === 'number') {
      return {
        ...kv,
        type: KeyValueType.Number,
        value: Number(kv.value),
      }
    }

    if (kv.type === KeyValueType.Boolean.toString()) {
      return {
        ...kv,
        type: KeyValueType.Boolean,
        value: kv.value === 'true',
      }
    }

    return {
      ...kv,
      type: KeyValueType.String,
      value: kv.value,
    }
  })
}
