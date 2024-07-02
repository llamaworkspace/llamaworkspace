import { handleUserSignup } from '@/components/auth/backend/handleUserSignup'
import { env } from '@/env.mjs'
import { prisma } from '@/server/db'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { type GetServerSidePropsContext } from 'next'
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from 'next-auth'
import EmailProvider, {
  SendVerificationRequestParams,
} from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import { EmailServicex } from '../messaging/EmailServicex'

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
    verifyRequest: '/auth/verify-request',
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
    EmailProvider({
      server: env.SMTP_EMAIL_SERVER,
      from: env.SMTP_EMAIL_FROM,
      sendVerificationRequest,
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

async function sendVerificationRequest(params: SendVerificationRequestParams) {
  const { identifier, url, provider } = params

  // Hack derived from callbackUrl actually existing in the provider object
  const { callbackUrl } = provider as unknown as { callbackUrl: string }
  if (!callbackUrl) {
    throw new Error('Missing callbackUrl')
  }
  const { host } = new URL(url)
  console.log(1111, host)
  const emailService = new EmailServicex()
  throw new Error('Not implemented')
  await emailService.send({
    to: identifier,
    templateName: 'MagicLinkEmail',
    payload: { loginCode: 'PEPE-is-a-car' },
  })
  // // NOTE: You are not required to use `nodemailer`, use whatever you want.
  // const transport = createTransport(provider.server)
  // // const emailHtml = render(
  // //   <SlackConfirmEmail validationCode="https://example.com" />,
  // // )
  // const emailHtml = render(<MagicLinkEmail loginCode="PEPE-is-a-car" />)
  // const result = await transport.sendMail({
  //   to: identifier,
  //   from: provider.from,
  //   subject: `Sign in to ${host}`,
  //   // text: textEmail({ callbackUrl }),
  //   html: emailHtml,
  // })
  // const failed = result.rejected.concat(result.pending).filter(Boolean)
  // if (failed.length) {
  //   throw new Error(`Email(s) (${failed.join(', ')}) could not be sent`)
  // }
}
