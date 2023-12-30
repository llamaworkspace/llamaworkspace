/**
 * This is the client-side entrypoint for your tRPC API. It is used to create the `api` object which
 * contains the Next.js App-wrapper, as well as your type-safe React Query hooks.
 *
 * We also create a few inference helpers for input and output types.
 */
import { env } from '@/env.mjs'
import { type RootRouter } from '@/server/trpc/rootRouter'
import { httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'
import superjson from 'superjson'

const NETWORK_MODE =
  env.NEXT_PUBLIC_ENV === 'production' ? 'online' : 'offlineFirst'

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '' // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}` // dev SSR should use localhost
}

/** A set of type-safe react-query hooks for your tRPC API. */
export const api = createTRPCNext<RootRouter>({
  config() {
    return {
      /**
       * Transformer used for data de-serialization from the server.
       *
       * @see https://trpc.io/docs/data-transformers
       */
      transformer: superjson,

      /**
       * Links used to determine request flow from client to server.
       *
       * @see https://trpc.io/docs/links
       */
      links: [
        loggerLink({
          enabled: (opts) =>
            env.NEXT_PUBLIC_TRPC_DEBUG === 'true' &&
            (env.NEXT_PUBLIC_ENV === 'development' ||
              (opts.direction === 'down' && opts.result instanceof Error)),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],

      queryClientConfig: {
        defaultOptions: {
          queries: {
            networkMode: NETWORK_MODE,
            staleTime: 1000,
            refetchOnMount: true,
            refetchOnWindowFocus: true,
            retry: 1,
            retryDelay: 2000,
          },
          mutations: {
            networkMode: NETWORK_MODE,
            retry: 1,
            retryDelay: 2000,
          },
        },
      },
    }
  },
  /**
   * Whether tRPC should await queries when server rendering pages.
   *
   * @see https://trpc.io/docs/nextjs#ssr-boolean-default-false
   */
  ssr: false,
})

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<RootRouter>

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<RootRouter>
