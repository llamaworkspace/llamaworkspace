import { sendEmailQueue } from '@/server/messaging/queues/sendEmailQueue'

export const queuesRegistry = [sendEmailQueue]
