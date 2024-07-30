import { createTRPCRouter } from '@/server/trpc/trpc'
import { userGetSelf } from './procedures/userGetSelf'
import { userGetUserOnWorkspace } from './procedures/userGetUserOnWorkspace'
import { userUpdateSelf } from './procedures/userUpdateSelf'

export const usersRouter = createTRPCRouter({
  getSelf: userGetSelf,
  updateSelf: userUpdateSelf,
  getUserOnWorkspace: userGetUserOnWorkspace,
})
