import { bullBoardService } from '@/apps/bullboard/bullBoardService'
import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { z } from 'zod'
import { llamaQManager } from '../lib/llamaQManager'

export const llamaqEnqueueHandler = new Hono()

const schema = z.object({
  queue: z.string(),
  action: z.string(),
  payload: z.unknown(),
})

const validationFunc = validator('json', (value, c) => {
  const parsed = schema.safeParse(value)
  if (!parsed.success) {
    return c.json(parsed.error, 401)
  }
  return parsed.data
})

llamaqEnqueueHandler.post(validationFunc, async (c) => {
  const { queue: queueName, action, payload } = c.req.valid('json')

  // Enqueue the job
  const queue = await llamaQManager.enqueue(queueName, action, payload)
  bullBoardService.addQueue(queue)

  return c.json(
    {
      queue,
      action,
      payload,
    },
    201,
  )
})
