import { queuesManager } from '@/server/queues/queuesManager'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

export const maxDuration = 300 // 5 minutes

const PayloadSchema = z.object({
  queue: z.string(),
  action: z.string(),
  payload: z.unknown(),
})

export async function POST(req: NextRequest) {
  const parsed = PayloadSchema.safeParse(await req.json())

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const { queue, action, payload } = parsed.data
  const res = await queuesManager.call(queue, action, payload)
  try {
    const json = JSON.stringify(res)
    return NextResponse.json(json)
  } catch (error) {
    return NextResponse.json({})
  }
}
