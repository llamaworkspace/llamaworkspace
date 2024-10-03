import { SignIn } from '@/components/auth/components/SignIn'
import { env } from '@/env.mjs'

export const getServerSideProps = () => {
  const isDemoMode = env.DEMO_MODE === 'true'
  return { props: { isDemoMode } }
}

export default function SignInPage({ isDemoMode }: { isDemoMode: boolean }) {
  return <SignIn isDemoMode={isDemoMode} />
}
