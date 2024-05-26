import { createNextApiHandler } from '@trpc/server/adapters/next'
import { rootRouter } from 'server/trpc/rootRouter'
import { createTRPCContext } from 'server/trpc/trpc'
import { trpcOnErrorHandler } from 'server/trpc/trpcOnErrorHandler'

// export API handler
export default createNextApiHandler({
  router: rootRouter,
  createContext: createTRPCContext,
  onError: trpcOnErrorHandler,
})
