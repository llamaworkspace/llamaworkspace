import type { PropsWithChildren } from 'react'

export function WebsiteHomeFeatureWrapper({ children }: PropsWithChildren) {
  return <div className="mx-auto max-w-6xl overflow-hidden">{children}</div>
}
