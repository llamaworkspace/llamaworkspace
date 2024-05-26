import { env } from '@/env.mjs'
import { errorLoggerForTRPC } from '@/shared/errors/errorLogger'
import type { createNextApiHandler } from '@trpc/server/adapters/next'
import { getHTTPStatusCodeFromError } from '@trpc/server/http'

interface MockedContext {
  session?: {
    user?: {
      id: string
    }
  }
}

type TRPCNextApiHandlerOnErrorCallback = Parameters<
  typeof createNextApiHandler
>[0]['onError']

export const trpcOnErrorHandler: TRPCNextApiHandlerOnErrorCallback = (
  params,
) => {
  // const { error, type, path, input, ctx, req } = params
  const { path, error, type } = params
  const ctx = params.ctx as MockedContext

  if (env.NODE_ENV === 'development') {
    console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`)
  }

  if (getHTTPStatusCodeFromError(error) >= 500) {
    errorLoggerForTRPC(error, {
      trpcPath: path,
      trpcType: type,
      userId: ctx.session?.user?.id,
    })
  }
}
