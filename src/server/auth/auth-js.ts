import NextAuth from 'next-auth'
import { cache } from 'react'

import { authJsConfig } from './auth-js-config'

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authJsConfig)

const auth = cache(uncachedAuth)

export { auth, handlers, signIn, signOut }
