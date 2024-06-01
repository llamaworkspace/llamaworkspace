import { env } from '@/env.mjs'
import { queuesManager } from 'apps/llamaws/server/queues/queuesManager'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

const SECRET_KEY = env.LLAMAQ_INCOMING_API_ROUTE_ACCESS_KEY

export const maxDuration = 300 // 5 minutes

const PayloadSchema = z.object({
  queue: z.string(),
  action: z.string(),
  payload: z.unknown(),
})

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return getUnauthorizedResponse()
  }

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

const isAuthenticated = (req: NextRequest) => {
  const authHeader = req.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }

  const token = authHeader.split(' ')[1]
  if (!token) return false

  if (token !== SECRET_KEY) return false
  return true
}

const getUnauthorizedResponse = () => {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
}
