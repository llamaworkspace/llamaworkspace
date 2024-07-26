import { OnboardingScreen } from '@/components/onboarding/components/OnboardingScreen'
import { useNavigation } from '@/lib/frontend/useNavigation'
import Image from 'next/image'

export default function Onboarding() {
  const navigation = useNavigation()
  const handleSuccess = () => {
    void navigation.push('/p')
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
          <OnboardingScreen onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  )
}
