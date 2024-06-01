import { z } from 'zod'
import { AbstractQueueManager } from '../../lib/AbstractQueueManager/AbstractQueueManager'

const zPayload = z.object({
  assetOnAppId: z.string(),
})

type UloadFileToOpenAIQueuePayload = z.infer<typeof zPayload>

class UloadFileToOpenAiQueue extends AbstractQueueManager<typeof zPayload> {
  readonly queueName = 'uploadFileToOpenAi'

  constructor(llamaqHostname?: string) {
    super(zPayload, llamaqHostname)
  }

  protected async handle(
    action: string,
    payload: UloadFileToOpenAIQueuePayload,
  ) {
    return Promise.resolve(true)
  }
}

export const uploadFileToOpenAiQueue = new UloadFileToOpenAiQueue()
