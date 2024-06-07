import { sendEmailQueue } from '@/server/mailer/queues/sendEmailQueue'

export const queuesRegistry = [sendEmailQueue]
