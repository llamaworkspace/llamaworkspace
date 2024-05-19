import { AssistantResponse } from 'ai'
import createHttpError from 'http-errors'
import OpenAI from 'openai'
import type { MessageCreateParams } from 'openai/resources/beta/threads/messages'
import { z } from 'zod'
import type { Strategy } from './runnersBase'

const message = {
  role: 'user',
  content: 'What is the meaning of life?',
} as MessageCreateParams

export const anotherStrategyParams = z.object({
  apiKey: z.string(),
  pepe: z.string(),
})

const anotherStrategyStreamParams = z.object({
  assistantId: z.string(),
  juan: z.string(),
})

type AnotherStrategyConstructorParams = z.infer<typeof anotherStrategyParams>
type AnotherStrategyStreamParams = z.infer<typeof anotherStrategyStreamParams>

export class AnotherAssistantStrategy
  implements Strategy<AnotherStrategyStreamParams>
{
  private readonly apiKey: string
  private readonly baseURL: string | undefined

  constructor(params: AnotherStrategyConstructorParams) {
    this.apiKey = params.apiKey
  }

  async stream(payload: AnotherStrategyStreamParams) {
    const openai = new OpenAI({ apiKey: this.apiKey, baseURL: this.baseURL })

    const thread = await openai.beta.threads.create({})
    const threadId = thread.id

    const createdMessage = await openai.beta.threads.messages.create(
      threadId,
      message,
    )

    return AssistantResponse(
      {
        threadId,
        messageId: createdMessage.id,
      },

      async ({ forwardStream }) => {
        const runStream = openai.beta.threads.runs.stream(threadId, {
          assistant_id: payload.assistantId,
        })

        // forward run status would stream message deltas
        const runResult = await forwardStream(runStream)
        // runResult.status can be: queued, in_progress, requires_action, cancelling, cancelled, failed, completed, or expired

        if (!runResult) {
          throw new Error('Run result is undefined')
        }

        while (runResult.status === 'requires_action') {}

        // if (['completed', 'cancelled'].includes(runResult.status)) {
        //   onFinal(runResult)
        // }

        if (runResult.status === 'failed') {
          const error = createHttpError(403, 'Run failed')
          error.payload = runResult
          // onError(error)
        }
      },
    )
  }

  validateStreamInputParams(params: AnotherStrategyStreamParams) {
    return anotherStrategyStreamParams.safeParse(params)
  }
}
