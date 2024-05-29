import { createBullBoard } from '@bull-board/api'
import { HonoAdapter } from '@bull-board/hono'
import { serveStatic } from '@hono/node-server/serve-static'

export const serverAdapter = new HonoAdapter(serveStatic)
serverAdapter.setBasePath('/ui')
export const bullBoard = createBullBoard({ queues: [], serverAdapter })
