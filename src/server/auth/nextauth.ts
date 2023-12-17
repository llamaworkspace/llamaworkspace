import { handleUserSignup } from '@/components/auth/handleUserSignup'
import { env } from '@/env.mjs'
import { prisma } from '@/server/db'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { type GetServerSidePropsContext } from 'next'
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      // ...other properties
      // role: UserRole;
    } & DefaultSession['user']
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  secret: env.ENCRYPTION_KEY,
  debug: false,
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // session.user.role = user.role; <-- put other properties on the session here
      }
      return session
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      await handleUserSignup(prisma, user.id)
    },
  },
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext['req']
  res: GetServerSidePropsContext['res']
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions)
}
