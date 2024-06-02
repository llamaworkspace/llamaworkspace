import { createTRPCRouter } from '@/server/trpc/trpc'
import { getAppAssets } from './procedures/getAppAssets'
import { performAppShare } from './procedures/performAppShare'
import { postsConfigGetLatestForAppId } from './procedures/postsConfigGetLatestForAppId'
import { postsConfigUpdate } from './procedures/postsConfigUpdate'
import { postsCreate } from './procedures/postsCreate'
import { postsDelete } from './procedures/postsDelete'
import { postsGetById } from './procedures/postsGetById'
import { postsGetDefault } from './procedures/postsGetDefault'
import { postsGetList } from './procedures/postsGetList'
import { postsGetShare } from './procedures/postsGetShare'
import { postsShareUpdate } from './procedures/postsShareUpdate'
import { postsShareUpdateAccessLevel } from './procedures/postsShareUpdateAccessLevel'
import { postsUpdate } from './procedures/postsUpdate'

export const postsRouter = createTRPCRouter({
  getDefault: postsGetDefault,
  getList: postsGetList,
  getById: postsGetById,
  create: postsCreate,
  update: postsUpdate,
  delete: postsDelete,
  share: performAppShare,
  getShare: postsGetShare,
  updateShare: postsShareUpdate,
  updateShareAccessLevel: postsShareUpdateAccessLevel,
  updateConfig: postsConfigUpdate,
  getLatestConfig: postsConfigGetLatestForAppId,
  getAppAssets,
})
