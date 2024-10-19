import { WebsiteHomeFeatureValueForMoneyBarChart } from './WebsiteHomeFeatureValueForMoneyBarChart'

export const WebsiteHomeValueForMoney = () => {
  return (
    <div className="mx-auto max-w-6xl space-y-16 px-6 lg:px-0">
      <div className="space-y-4">
        <h1 className=" mx-auto font-heading text-4xl font-semibold tracking-tighter text-zinc-900 sm:text-6xl">
          Keep costs under control.
        </h1>
        <h2 className="max-w-3xl text-2xl font-medium tracking-tight text-zinc-950">
          Save up to 82% on subscription costs compared to similar solutions
          such as ChatGPT Enterprise.
        </h2>
      </div>
      <WebsiteHomeFeatureValueForMoneyBarChart />
    </div>
  )
}
