import Image from 'next/image'
import { WebsiteHomeFeatureWrapper } from './WebsiteHomeFeatureWrapper'

export function WebsiteHomeFeatureUserManagement() {
  return (
    <WebsiteHomeFeatureWrapper>
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 rounded-lg bg-slate-100 p-8 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
        <div className="lg:pr-8 lg:pt-4">
          <div className="lg:max-w-lg">
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              One-stop shop for team access & payments
            </p>
            <p className="mt-6 text-2xl font-medium leading-8 tracking-tighter text-zinc-900">
              Tired of the individual sign-up chaos and scattered payments for
              ChatGPT Plus? We bring order: easy access management, one central
              payment point.
            </p>
          </div>
        </div>
        <div>
          <Image
            src="/images/chatbot_user_management.png"
            alt="User management interface"
            className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-zinc-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
            width={2432}
            height={1442}
          />
        </div>
      </div>
    </WebsiteHomeFeatureWrapper>
  )
}
