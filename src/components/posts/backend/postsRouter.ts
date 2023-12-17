import { createTRPCRouter } from '@/server/trpc/trpc'
import { postsCreate } from './procedures/postsCreate'
import { postsGetShares } from './procedures/postsGetShares'
import { postsUpdate } from './procedures/postsUpdate'
import { postsDelete } from './procedures/postsDelete'
import { postsGetById } from './procedures/postsGetById'
import { postsConfigUpdate } from './procedures/postsConfigUpdate'
import { postsConfigGetLatestForPostId } from './procedures/postsConfigGetLatestForPostId'
import { postsConfigGetForChatId } from './procedures/postsConfigGetForChatId'
import { postsSharePerform } from './procedures/postsSharePerform'
import { postsShareUpdateAccessLevel } from './procedures/postsShareUpdateAccessLevel'
import { postsGetLatest } from './procedures/postsGetLatest'
import { postsGetDefault } from './procedures/postsGetDefault'

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
