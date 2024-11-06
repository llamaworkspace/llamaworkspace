import { env } from '@/env.mjs'
import { ensureError } from '@/lib/utils'
import { queuesManager } from '@/server/queues/queuesManager'
import { isDevelopment } from '@/server/utils/globalServerUtils'
import { errorLogger } from '@/shared/errors/errorLogger'
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

const SECRET_KEY = env.LLAMAQ_INCOMING_API_ROUTE_ACCESS_KEY

const payloadSchema = z.object({
  jobId: z.string(),
  jobAttemptNumber: z.number(),
  queue: z.string(),
  action: z.string(),
  payload: z.unknown(),
})

type Payload = z.infer<typeof payloadSchema>

export const _llamaQHandler = async (req: NextRequest) => {
  if (!isAuthenticated(req)) {
    return getUnauthorizedResponse()
  }

  const json = (await req.json()) as unknown

  if (isDevelopment) {
    logIncomingEvent(json as Payload)
  }

  const safeJson = payloadSchema.safeParse(json)

  if (!safeJson.success) {
    return NextResponse.json({ error: safeJson.error }, { status: 400 })
  }

  const { queue, action, payload } = safeJson.data

  await queuesManager.call(queue, action, payload)
  return NextResponse.json({ success: true })
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

const withCaptureErrorsForLlamaQHandler = (handler: typeof _llamaQHandler) => {
  return async (request: NextRequest) => {
    try {
      return await handler(request)
    } catch (_error) {
      const error = ensureError(_error)
      errorLogger(error)

      return NextResponse.json({ message: error.message }, { status: 500 })
    }
  }
}

const logIncomingEvent = (json: Payload) => {
  console.log(
    `Processing LlamaQ event. Queue: ${json.queue}, Action: ${json.action}, Id: ${json.jobId}, attemptNumber: ${json.jobAttemptNumber}`,
  )
  console.log('Payload:', json.payload)
}

export const llamaQHandler = withCaptureErrorsForLlamaQHandler(_llamaQHandler)
