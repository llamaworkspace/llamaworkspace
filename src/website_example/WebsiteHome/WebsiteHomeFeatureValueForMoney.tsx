import { WebsiteHomeFeatureValueForMoneyBarChart } from './WebsiteHomeFeatureValueForMoney/WebsiteHomeFeatureValueForMoneyBarChart'
import { WebsiteHomeFeatureWrapper } from './WebsiteHomeFeatureWrapper'

export function WebsiteHomeFeatureValueForMoney() {
  return (
    <WebsiteHomeFeatureWrapper>
      <h2 className="mx-auto mb-16 mt-2 max-w-3xl text-center text-3xl font-bold tracking-tight text-zinc-900 sm:text-6xl">
        Your bank account
        <br />
        will thank us
      </h2>
      <div className="mx-auto grid max-w-2xl grid-cols-1 lg:mx-0 lg:max-w-none lg:grid-cols-2">
        <div className="flex items-center">
          <div className="lg:max-w-lg">
            <p className="mt-6 text-center text-2xl font-medium leading-8 tracking-tighter text-zinc-900 md:text-right">
              Joia links directly to OpenAI via API keys, meaning you only pay
              for what you use. Forget pricey monthly subscriptions; we&apos;re
              all about smart savings.
            </p>
          </div>
        </div>
        <div className="">
          <WebsiteHomeFeatureValueForMoneyBarChart />
        </div>
      </div>
    </WebsiteHomeFeatureWrapper>
  )
}