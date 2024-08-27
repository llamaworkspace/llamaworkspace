import {
  sendEmailTaskHandler,
  type SendEmailTaskPayload,
} from '@/server/messaging/queues/sendEmailTaskHandler'
import { task } from '@trigger.dev/sdk/v3'

export const sendEmailTask = task({
  id: 'sendEmailTask',
  run: async (payload: SendEmailTaskPayload, { ctx }) => {
    return await sendEmailTaskHandler(payload)
  },
})
