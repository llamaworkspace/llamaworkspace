import { WebsiteHomeFeatureValueForMoneyBarChart } from './WebsiteHomeFeatureValueForMoneyBarChart'

export const WebsiteHomeValueForMoney = () => {
  return (
    <div className="mx-auto max-w-6xl space-y-16 px-6 lg:px-0">
      <div className="space-y-4">
        <h1 className="mx-auto text-4xl font-semibold tracking-tighter text-zinc-900 sm:text-6xl">
          Give AI access to your teams
          <br />
          <span className="bg-gradient-to-r from-[#d162b5] to-[#5f6fd1] bg-clip-text text-transparent">
            while keeping costs under control
          </span>
        </h1>
        <h2 className="max-w-3xl text-2xl font-medium tracking-tight text-zinc-600">
          Save 70% compared to ChatGPT Teams and 82% compared to ChatGPT
          Enterprise.
        </h2>
      </div>
      <WebsiteHomeFeatureValueForMoneyBarChart />
    </div>
  )
}
