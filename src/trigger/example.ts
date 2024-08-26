import { configure, logger, task, wait } from '@trigger.dev/sdk/v3'

configure({
  baseURL: 'http://localhost:3040',
  secretKey: 'tr_dev_w90kAphukHiGQgu4gJnz',
})

export interface HelloWorldTaskPayload {
  message: string
}

export const helloWorldTask = task({
  id: 'hello-world',
  run: async (payload: HelloWorldTaskPayload, { ctx }) => {
    logger.log(payload.message, { payload, ctx })

    await wait.for({ seconds: 1 })

    return {
      message: 'This is done! We have emitted the message: ' + payload.message,
    }
  },
})
