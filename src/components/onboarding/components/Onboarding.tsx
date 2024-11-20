import { OnboardingSetApiKeys } from '@/components/onboarding/components/OnboardingSetApiKeys'
import { OnboardingSetWorkspaceName } from '@/components/onboarding/components/OnboardingSetWorkspaceName'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const handleSuccess = () => {
    const nextStep = step + 1

    if (nextStep > 2) {
      router.push('/p')
    } else {
      setStep(nextStep)
    }
  }

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
            Welcome to Llama Workspace
          </div>
          {step === 1 && (
            <OnboardingSetWorkspaceName onSuccess={handleSuccess} />
          )}
          {step === 2 && <OnboardingSetApiKeys onSuccess={handleSuccess} />}
        </div>
      </div>
    </div>
  )
}
