import { rootRouter } from '@/server/trpc/rootRouter'
import { createTRPCContext } from '@/server/trpc/trpc'
import { trpcOnErrorHandler } from '@/server/trpc/trpcOnErrorHandler'
import { createNextApiHandler } from '@trpc/server/adapters/next'

// export API handler
export default createNextApiHandler({
  router: rootRouter,
  createContext: createTRPCContext,
  onError: trpcOnErrorHandler,
})
