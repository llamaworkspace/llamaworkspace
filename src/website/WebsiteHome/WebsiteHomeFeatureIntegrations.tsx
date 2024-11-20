import { StyledLink } from '@/components/ui/StyledLink'
import Image from 'next/image'
import { WebsiteHomeFeatureWrapper } from './WebsiteHomeFeatureWrapper'

export function WebsiteHomeFeatureIntegrations() {
  return (
    <WebsiteHomeFeatureWrapper>
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 rounded-lg bg-[#f4f4e7] bg-opacity-50 p-8 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
        <div className="lg:pr-8 lg:pt-4">
          <div className="lg:max-w-lg">
            <h1 className="font-heading mt-2 text-2xl font-bold tracking-tighter text-zinc-900 sm:text-4xl">
              Integrate with other AI tools or your own code.
            </h1>
            <h2 className="mt-6 text-xl tracking-tight text-zinc-900 sm:text-2xl">
              Provide a frontend for your internal AI tools. Integrate your code
              in minutes{' '}
              <StyledLink
                target="_blank"
                className="font-semibold"
                href="https://docs.llamaworkspace.ai/javascript-sdk/installation"
              >
                using our SDK.
              </StyledLink>
            </h2>
          </div>
        </div>
        <Image
          src="/images/2024-09/home_code_integrations.png"
          alt="External integrations with your code"
          className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-zinc-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
          width={2432}
          height={1442}
        />
      </div>
    </WebsiteHomeFeatureWrapper>
  )
}
