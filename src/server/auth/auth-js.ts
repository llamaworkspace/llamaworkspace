import NextAuth from 'next-auth'
import { cache } from 'react'

import { authJsConfig } from './auth-js-config'

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authJsConfig)

const auth = cache(uncachedAuth)

export const providerMap = authJsConfig.providers
  .map((provider) => {
    if (typeof provider === 'function') {
      const providerData = provider()
      return { id: providerData.id, name: providerData.name }
    } else {
      return { id: provider.id, name: provider.name }
    }
  })
  .filter((provider) => provider.id !== 'credentials')
export { auth, handlers, signIn, signOut }
