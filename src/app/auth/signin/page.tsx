import SignInTemp from '@/components/auth/components/SigninTemp'

export default function SignInPage() {
  // return <SignIn />
  return <SignInTemp searchParams={{ callbackUrl: '' }} />
}
