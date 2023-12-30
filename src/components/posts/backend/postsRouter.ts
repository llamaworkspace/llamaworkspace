import { createTRPCRouter } from '@/server/trpc/trpc'
import { postsConfigGetForChatId } from './procedures/postsConfigGetForChatId'
import { postsConfigGetLatestForPostId } from './procedures/postsConfigGetLatestForPostId'
import { postsConfigUpdate } from './procedures/postsConfigUpdate'
import { postsCreate } from './procedures/postsCreate'
import { postsDelete } from './procedures/postsDelete'
import { postsGetById } from './procedures/postsGetById'
import { postsGetDefault } from './procedures/postsGetDefault'
import { postsGetLatest } from './procedures/postsGetLatest'
import { postsGetShares } from './procedures/postsGetShares'
import { postsSharePerform } from './procedures/postsSharePerform'
import { postsShareUpdateAccessLevel } from './procedures/postsShareUpdateAccessLevel'
import { postsUpdate } from './procedures/postsUpdate'

export const postsRouter = createTRPCRouter({
  getDefault: postsGetDefault,
  getById: postsGetById,
  create: postsCreate,
  update: postsUpdate,
  delete: postsDelete,
  share: postsSharePerform,
  getShares: postsGetShares,
  updateShareAccessLevel: postsShareUpdateAccessLevel,
  updateConfig: postsConfigUpdate,
  getLatestConfig: postsConfigGetLatestForPostId,
  getConfigForChatId: postsConfigGetForChatId,
  getLatestPost: postsGetLatest,
})
