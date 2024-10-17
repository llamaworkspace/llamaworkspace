import Image from 'next/image'
import { WebsiteHomeFeatureWrapper } from './WebsiteHomeFeatureWrapper'

export function WebsiteHomeFeatureMultiModel() {
  return (
    <WebsiteHomeFeatureWrapper>
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 rounded-lg bg-zinc-100 bg-opacity-60 p-8 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
        <div className="lg:pr-8 lg:pt-4">
          <div className="lg:max-w-lg">
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Chat with Gpt-4o, Claude Sonnet and the latest Llama. All from a
              single interface.
            </p>
            <p className="mt-6 text-2xl leading-8 tracking-tighter text-zinc-900">
              Ensure continous access to the most powerful models and getting
              trapped with a specific AI vendor.
            </p>
          </div>
        </div>
        <Image
          src="/images/2024-09/home_multimodel.png"
          alt="Multi-models"
          className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-zinc-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
          width={734}
          height={394}
        />
      </div>
    </WebsiteHomeFeatureWrapper>
  )
}
