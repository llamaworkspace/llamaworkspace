import { llamaQHandler } from '@/server/queues/handlers/llamaQHandler'
import { type NextRequest } from 'next/server'

export const maxDuration = 300 // 5 minutes

export async function POST(req: NextRequest) {
  return await llamaQHandler(req)
}
