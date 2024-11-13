import { SignIn } from '@/components/auth/components/SignIn'
import { buildMetaTitle } from '@/lib/frontend/build-meta-title'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: buildMetaTitle('Sign In'),
}

export default function SignInPage() {
  return <SignIn />
}
