import { OnboardingScreen } from '@/components/onboarding/components/OnboardingScreen'
import Image from 'next/image'

export default function Onboarding() {
  return (
    <div className="min-h-full bg-zinc-100 py-16">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="px-8 md:px-0">
          <Image
            alt="Llama Workspace logo"
            src="/images/llama-workspace-logo-black-square.svg"
            width="64"
            height="64"
            className="self-center"
          />
        </div>
        <div className="space-y-4 rounded bg-white p-8">
          <div className="leading-nont text-xl font-semibold tracking-tight">
            Let&apos;s get this party started
          </div>
          <OnboardingScreen />
        </div>
      </div>
    </div>
  )
}
