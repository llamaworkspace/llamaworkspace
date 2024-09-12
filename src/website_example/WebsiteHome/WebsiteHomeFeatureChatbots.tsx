import Image from 'next/image'
import { WebsiteHomeFeatureWrapper } from './WebsiteHomeFeatureWrapper'

export function WebsiteHomeFeatureChatbots() {
  return (
    <WebsiteHomeFeatureWrapper>
      <div className="bg-sand-lightest mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 rounded-lg p-8 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
        <div className="lg:pr-8 lg:pt-4">
          <div className="lg:max-w-lg">
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Craft & share your personalised chatbots
            </p>
            <p className="mt-6 text-2xl font-medium leading-8 tracking-tighter text-zinc-900">
              Endless copy-pasting of lengthy prompts is in the past. Craft your
              own chatbots (aka agents or GPTs) for specific tasks, and share
              the genius with your team.
            </p>
          </div>
        </div>

        <Image
          src="/images/chatbot_setup.png"
          alt="Chatbot setup"
          className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-zinc-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
          width={2432}
          height={1442}
        />
      </div>
    </WebsiteHomeFeatureWrapper>
  )
}
