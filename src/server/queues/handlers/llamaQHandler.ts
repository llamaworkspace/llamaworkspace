import { env } from '@/env.mjs'
import { withMiddlewareForAppRouter } from '@/server/middlewares/withMiddleware'
import { queuesManager } from '@/server/queues/queuesManager'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

const SECRET_KEY = env.LLAMAQ_INCOMING_API_ROUTE_ACCESS_KEY

const payloadSchema = z.object({
  queue: z.string(),
  action: z.string(),
  payload: z.unknown(),
})

export const _llamaQHandler = async (req: NextRequest) => {
  if (!isAuthenticated(req)) {
    return getUnauthorizedResponse()
  }

  const parsed = payloadSchema.safeParse(await req.json())

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const { queue, action, payload } = parsed.data

  const res = await queuesManager.call(queue, action, payload)

  const json = JSON.stringify(res)
  return NextResponse.json(json)
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

export const llamaQHandler = withMiddlewareForAppRouter(_llamaQHandler)

// console.log(222222, error)
// if (error instanceof ZodError) {
//   const formattedError = error.format()
//   return NextResponse.json(
//     { message: JSON.stringify(formattedError), isAppError: true },
//     { status: 400 },
//   )
// }
