import Image from 'next/image'
import { WebsiteHomeFeatureWrapper } from './WebsiteHomeFeatureWrapper'

export function WebsiteHomeFeatureMultiModel() {
  return (
    <WebsiteHomeFeatureWrapper>
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 rounded-lg bg-zinc-100 bg-opacity-60 p-6 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
        <div className="lg:pr-8 lg:pt-4">
          <div className="lg:max-w-lg">
            <h1 className="mt-2 font-heading text-2xl font-bold tracking-tighter text-zinc-900 sm:text-4xl">
              Chat with GPT-4, Claude or the latest Llama. We have them all.
            </h1>
            <h2 className="mt-6 text-xl tracking-tight text-zinc-900 sm:text-2xl">
              Access the most powerful models through a single interface and
              subscription.
            </h2>
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
