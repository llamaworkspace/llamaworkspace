import { createTRPCRouter } from '@/server/trpc/trpc'
import { appsAttachAsset } from './procedures/appsAttachAsset'
import { appsConfigGetLatestForAppId } from './procedures/appsConfigGetLatestForAppId'
import { appsConfigUpdate } from './procedures/appsConfigUpdate'
import { appsCreate } from './procedures/appsCreate'
import { appsDelete } from './procedures/appsDelete'
import { appsGetById } from './procedures/appsGetById'
import { appsGetDefault } from './procedures/appsGetDefault'
import { appsGetList } from './procedures/appsGetList'
import { appsGetShare } from './procedures/appsGetShare'
import { appsShareUpdate } from './procedures/appsShareUpdate'
import { appsShareUpdateAccessLevel } from './procedures/appsShareUpdateAccessLevel'
import { appsUpdate } from './procedures/appsUpdate'
import { getAppAssets } from './procedures/getAppAssets'
import { performAppShare } from './procedures/performAppShare'

export const appsRouter = createTRPCRouter({
  getDefault: appsGetDefault,
  getList: appsGetList,
  getById: appsGetById,
  create: appsCreate,
  update: appsUpdate,
  delete: appsDelete,
  share: performAppShare,
  getShare: appsGetShare,
  updateShare: appsShareUpdate,
  updateShareAccessLevel: appsShareUpdateAccessLevel,
  updateConfig: appsConfigUpdate,
  getLatestConfig: appsConfigGetLatestForAppId,
  getAppAssets,
  attachAsset: appsAttachAsset,
})
