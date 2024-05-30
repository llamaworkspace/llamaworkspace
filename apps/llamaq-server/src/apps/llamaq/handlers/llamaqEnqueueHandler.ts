import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { z } from 'zod'
import { bullBoardService } from '../../bullboard/bullBoardService'
import { llamaQManagerxx } from '../lib/llamaQManager'

export const llamaqEnqueueHandler = new Hono()

const schema = z.object({
  queueName: z.string(),
  actionName: z.string(),
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
  const { queueName, actionName, payload } = c.req.valid('json')

  // Enqueue the job
  const queue = await llamaQManagerxx.enqueue(queueName, actionName, payload)
  bullBoardService.addQueue(queue)

  return c.json(
    {
      queueName,
      actionName,
      payload,
    },
    201,
  )
})
