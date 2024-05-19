import { env } from '@/env.mjs'
import { AssistantResponse } from 'ai'
import createHttpError from 'http-errors'
import OpenAI from 'openai'
import type { MessageCreateParams } from 'openai/resources/beta/threads/messages'

const message = {
  role: 'user',
  content: 'What is the meaning of life?',
} as MessageCreateParams

const assistantId = 'asst_xlWStmqHYrJC5IsxQm6D0W8t'

export class OpenaiAssistantRunner implements Strategy {
  async stream() {
    const openai = new OpenAI({ apiKey: env.INTERNAL_OPENAI_API_KEY })

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
          assistant_id: assistantId,
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
}

interface Strategy {
  stream(): Promise<unknown>
}
