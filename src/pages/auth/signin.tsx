import { SignIn } from '@/components/auth/components/SignIn'
import { env } from '@/env.mjs'

export const getServerSideProps = () => {
  const isDemoMode = env.DEMO_MODE === 'true'
  console.log(1, env.DEMO_MODE, isDemoMode)
  return { props: { isDemoMode } }
}

export default function SignInPage({ isDemoMode }: { isDemoMode: boolean }) {
  return (
    <div>
      <div>
        <h1>Main Page</h1>
        <div>ENV: {isDemoMode.toString()}</div>
        {/* <pre>
          <code>{JSON.stringify(envServerSide, null, 2)}</code>
        </pre> */}
      </div>
      <SignIn isDemoMode={isDemoMode} />
    </div>
  )
}
