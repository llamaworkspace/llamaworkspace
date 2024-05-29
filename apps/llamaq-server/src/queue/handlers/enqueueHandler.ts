import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { z } from 'zod'
import { llamaQ } from '../../llamaQSingleton'

const hono = new Hono()

const zPayload = z.object({
  queueName: z.string(),
  actionName: z.string(),
  payload: z.unknown(),
})

const validationFunc = validator('json', (value, c) => {
  const parsed = zPayload.safeParse(value)
  if (!parsed.success) {
    // Handle validation error
    return c.text('Invalid!', 401)
  }
  return parsed.data
})

export const enqueueHandler = hono.post(
  '/enqueue',
  validationFunc,
  async (c) => {
    console.log('About to enqueue')
    const { queueName, actionName, payload } = c.req.valid('json')
    console.log('About to enqueue 2', queueName, actionName, payload)
    // Try to enqueue the job, catch with sentry
    const queue = await llamaQ.enqueue(queueName, actionName, payload)
    // bullBoard.addQueue(new BullMQAdapter(queue))
    console.log('Enqueued job', queueName, actionName, payload)

    return c.json(
      {
        success: true,
      },
      201,
    )
  },
)
