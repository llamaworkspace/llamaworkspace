import {
  sendEmailTaskHandler,
  type SendEmailTaskPayload,
} from '@/server/messaging/queues/sendEmailTaskHandler'
import { configure, task } from '@trigger.dev/sdk/v3'

configure({
  // baseURL: 'http://localhost:3040',
  // secretKey: 'tr_pat_a5qcfmm15sdtr37tpdonqyw65vq3tgwqc7k8ezgy',
  secretKey: 'tr_dev_dyMdXb2busz71wtLimL5',
})

export const sendEmailTask = task({
  id: 'sendEmailTask',
  run: async (payload: SendEmailTaskPayload, { ctx }) => {
    return await sendEmailTaskHandler(payload)
  },
})
