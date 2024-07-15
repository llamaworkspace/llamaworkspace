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
      return 'Simple assistant'
    case AppEngineType.Assistant:
      return 'Document-enhanced assistant'
    case AppEngineType.External:
      return 'Externally-powered assistant'
    default:
      throw new Error(`A friendly name has not been set for an engine type`)
  }
}
