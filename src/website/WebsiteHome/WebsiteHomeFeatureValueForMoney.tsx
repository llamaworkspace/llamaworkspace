import { WebsiteHomeFeatureValueForMoneyBarChart } from './WebsiteHomeFeatureValueForMoney/WebsiteHomeFeatureValueForMoneyBarChart'
import { WebsiteHomeFeatureWrapper } from './WebsiteHomeFeatureWrapper'

export function WebsiteHomeFeatureValueForMoney() {
  return (
    <WebsiteHomeFeatureWrapper>
      <div className="grid grid-cols-2 gap-x-8">
        <h2 className="mx-auto mb-16 mt-2 max-w-3xl text-3xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          Pricing designed
          <br />
          to help you save money.
        </h2>

        <div className="mx-auto grid max-w-2xl grid-cols-1 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <WebsiteHomeFeatureValueForMoneyBarChart />
        </div>
      </div>
    </WebsiteHomeFeatureWrapper>
  )
}
