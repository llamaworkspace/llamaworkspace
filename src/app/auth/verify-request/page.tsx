import { VerifyRequest } from '@/components/auth/components/VerifyRequest'
import { buildMetaTitle } from '@/lib/frontend/build-meta-title'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: buildMetaTitle('Verify Request'),
}

export default function VerifyRequestPage() {
  return <VerifyRequest />
}
