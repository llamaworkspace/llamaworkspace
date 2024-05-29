import { Hono } from 'hono'
import { enqueueHandler } from './queue/handlers/enqueueHandler'

const queueRouter = new Hono()

queueRouter.route('/', enqueueHandler)

export { queueRouter }
