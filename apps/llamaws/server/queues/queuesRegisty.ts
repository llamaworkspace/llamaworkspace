import { assetBindQueue } from '@/server/assets/queues/onAssetBindQueue'
import { sendEmailQueue } from '@/server/messaging/queues/sendEmailQueue'

export const queuesRegistry = [sendEmailQueue, assetBindQueue]
