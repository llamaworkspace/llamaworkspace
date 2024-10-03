import { AppEngineType } from '@/components/apps/appsTypes'
import type { Prisma } from '@prisma/client'

export const scopeAppByWorkspace = (
  whereClause: Prisma.AppWhereInput,
  workspaceId: string,
) => {
  return {
    ...whereClause,
    workspaceId,
  }
}

export const getAppEngineFriendlyName = (engineType: AppEngineType) => {
  switch (engineType) {
    case AppEngineType.Default:
    case AppEngineType.Assistant:
      return 'AI Assistant'
    case AppEngineType.External:
      return 'Externally-powered Assistant'
    default:
      throw new Error(`A friendly name has not been set for engine type`)
  }
}
