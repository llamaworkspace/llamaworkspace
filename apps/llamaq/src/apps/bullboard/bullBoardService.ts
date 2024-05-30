import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { HonoAdapter } from '@bull-board/hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { Queue } from 'bullmq'
import { Hono } from 'hono'

const bullboardAdapterForHono = new HonoAdapter(serveStatic)

const bullBoard = createBullBoard({
  queues: [],
  serverAdapter: bullboardAdapterForHono,
})

export const bullBoardService = {
  addQueue: (queue: Queue) => {
    bullBoard.addQueue(new BullMQAdapter(queue))
  },
  removeQueue: (queue: Queue) => {
    bullBoard.removeQueue(queue.name)
  },
  setQueues: (queues: Queue[]) => {
    bullBoard.setQueues(queues.map((queue) => new BullMQAdapter(queue)))
  },
  replaceQueues: (queues: Queue[]) => {
    bullBoard.replaceQueues(queues.map((queue) => new BullMQAdapter(queue)))
  },
  registerRouter: (app: Hono, path: string) => {
    bullboardAdapterForHono.setBasePath(path)
    // @ts-ignore
    app.route(path, bullboardAdapterForHono.registerPlugin())
  },
}
