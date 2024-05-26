import { createTRPCRouter } from '@/server/trpc/trpc'
import { userGetSelf } from './procedures/userGetSelf'
import { userUpdateSelf } from './procedures/userUpdateSelf'

export const usersRouter = createTRPCRouter({
  getSelf: userGetSelf,
  updateSelf: userUpdateSelf,
})
