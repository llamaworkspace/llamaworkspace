'use server'
import { signIn } from '@/server/auth/auth-js'
// import { redirect } from 'next/navigation'

// Define the server action
export const emailSignIn = async (email: string, callbackUrl: string) => {
  'use server'
  console.log('222')
  return
  try {
    await signIn('email', {
      email,
      callbackUrl,
    })
  } catch (error) {
    // if (error instanceof AuthError) {
    //   redirect(`/signin?error=${error.type}`)
    // }
    throw error
  }
}
