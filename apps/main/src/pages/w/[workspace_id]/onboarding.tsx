import { OnboardingSetApiKeys } from '@/components/onboarding/components/OnboardingSetApiKeys'
import { OnboardingSetWorkspaceName } from '@/components/onboarding/components/OnboardingSetWorkspaceName'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { getServerAuthSession } from '@/server/auth/nextauth'
import { prisma } from '@/server/db'
import type { GetServerSideProps, GetServerSidePropsContext } from 'next'
import Image from 'next/image'
import { useState } from 'react'

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { query } = context
  const { workspace_id } = query

  const session = await getServerAuthSession(context)

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspace_id as string,
      users: {
        some: {
          userId: session?.user.id,
        },
      },
    },
  })

  if (!workspace) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    }
  }

  if (workspace?.onboardingCompletedAt) {
    return { redirect: { destination: `/p`, permanent: false } }
  }

  return { props: {} }
}

export default function Onboarding() {
  const navigation = useNavigation()
  const [step, setStep] = useState(1)
  const handleSuccess = async () => {
    const nextStep = step + 1

    if (nextStep > 2) {
      await navigation.push('/p')
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
