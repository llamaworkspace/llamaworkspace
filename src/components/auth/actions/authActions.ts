'use server'

import { signIn } from '@/server/auth/auth-js'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'

export const emailSignInAction = async (email: string, callbackUrl: string) => {
  try {
    await signIn('nodemailer', {
      email,
      redirectTo: callbackUrl,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/signin?error=${error.type}`)
    }
    throw error
  }
}