import { assetBindQueue } from '@/server/assets/queues/onAssetBindQueue'
import { sendEmailQueue } from '@/server/mailer/queues/sendEmailQueue'

export const queuesRegistry = [sendEmailQueue, assetBindQueue]
