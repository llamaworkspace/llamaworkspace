import type { PropsWithChildren } from 'react'
import { Separator } from './separator'

export const SectionWrapper = ({ children }: PropsWithChildren) => {
  return (
    <div className="w-full overflow-y-auto px-4 pb-16 pt-8 md:px-0">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <div>{children}</div>
      </div>
    </div>
  )
}

export const SectionWrapperHeader = ({ children }: PropsWithChildren) => {
  return <div className="mb-8">{children}</div>
}

export const SectionWrapperTitle = ({ children }: PropsWithChildren) => {
  return (
    <div className="mb-12 border-b pb-4 text-3xl font-bold tracking-tight">
      {children}
    </div>
  )
}

export const Section = ({ children }: PropsWithChildren) => {
  return <div className="mb-12 space-y-4">{children}</div>
}

export const SectionDivider = () => {
  return <Separator className="mb-8" />
}

interface SectionHeaderProps {
  title: string
  description?: string
}

export const SectionHeader = ({ title, description }: SectionHeaderProps) => {
  return (
    <div className="space-y-1">
      <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
      {description && <h4 className="text-sm text-zinc-600">{description}</h4>}
    </div>
  )
}

export const SectionBody = ({ children }: PropsWithChildren) => {
  return <div className="space-y-8">{children}</div>
}
