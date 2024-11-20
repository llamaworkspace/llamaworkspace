import { redirect } from 'next/navigation'

export function MainPageRedirector() {
  redirect(`/p`) // Navigate to a neutral path
  return null
}
