import { Hono } from 'hono'
import { llamaqEnqueueHandler } from './handlers/llamaqEnqueueHandler'

const llamaqRouter = new Hono()
llamaqRouter.route('/enqueue', llamaqEnqueueHandler)

export { llamaqRouter }
