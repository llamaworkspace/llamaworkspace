import { createTRPCRouter } from '@/server/trpc/trpc'
import { postsConfigGetLatestForPostId } from './procedures/postsConfigGetLatestForPostId'
import { postsConfigUpdate } from './procedures/postsConfigUpdate'
import { postsCreate } from './procedures/postsCreate'
import { postsDelete } from './procedures/postsDelete'
import { postsGetById } from './procedures/postsGetById'
import { postsGetDefault } from './procedures/postsGetDefault'
import { postsGetForAppsList } from './procedures/postsGetForAppsList'
import { postsGetLatest } from './procedures/postsGetLatest'
import { postsGetShare } from './procedures/postsGetShare'
import { postsSharePerform } from './procedures/postsSharePerform'
import { postsShareUpdate } from './procedures/postsShareUpdate'
import { postsShareUpdateAccessLevel } from './procedures/postsShareUpdateAccessLevel'
import { postsUpdate } from './procedures/postsUpdate'

export const postsRouter = createTRPCRouter({
  getDefault: postsGetDefault,
  getForAppsList: postsGetForAppsList,
  getById: postsGetById,
  create: postsCreate,
  update: postsUpdate,
  delete: postsDelete,
  share: postsSharePerform,
  getShare: postsGetShare,
  updateShare: postsShareUpdate,
  updateShareAccessLevel: postsShareUpdateAccessLevel,
  updateConfig: postsConfigUpdate,
  getLatestConfig: postsConfigGetLatestForPostId,
  getLatestPost: postsGetLatest,
})
