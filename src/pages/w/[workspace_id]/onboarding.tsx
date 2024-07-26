import { OnboardingScreen } from '@/components/onboarding/components/OnboardingScreen'
import Image from 'next/image'

export default function Onboarding() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-12">
      <Image
        alt="Llama Workspace logo"
        src="/images/llama-workspace-logo-black-square.svg"
        width="64"
        height="64"
        className="self-center"
      />
      <div className="leading-nont text-xl font-semibold tracking-tight">
        Let&apos;s get this party started
      </div>
      <OnboardingScreen />
    </div>
  )
}
