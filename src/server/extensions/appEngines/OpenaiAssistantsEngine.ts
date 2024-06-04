import { env } from '@/env.mjs'
import {
  AbstractAppEngine,
  type AppEngineRuntimeContext,
} from '@/server/ai/lib/BaseEngine'
import { CustomTextStreamResponse } from '@/server/ai/lib/CustomTextStreamResponse'
import OpenAI from 'openai'

export class OpenaiAssistantsEngine extends AbstractAppEngine {
  getName() {
    return 'OpenaiAssistantsEngine'
  }

  async run(ctx: AppEngineRuntimeContext) {
    const openai = new OpenAI({
      // This needs to be provided at runtime
      apiKey: env.INTERNAL_OPENAI_API_KEY,
    })

    const thread = await openai.beta.threads.create({})
    const threadId = thread.id

    const createdMessage = await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: 'Say "soy miguel el del sombrero"',
    })

    return CustomTextStreamResponse(
      {
        threadId,
        messageId: createdMessage.id,
      },
      { onToken: () => {}, onFinal: () => {} },
      async ({
        threadId,
        messageId,
        sendMessage,
        sendDataMessage,
        sendTextMessage,
        forwardStream,
      }) => {
        const streamAsAsyncIterable = openai.beta.threads.runs.stream(
          threadId,
          {
            assistant_id: 'asst_sk18bpznVq02EKXulK5S3X8L',
          },
        )

        for await (const message of streamAsAsyncIterable) {
          if (message.event === 'thread.message.delta') {
            const contents = message.data.delta.content
            contents?.forEach((content) => {
              if (content.type === 'text' && content.text?.value) {
                sendTextMessage(content.text.value)
              }
            })
          }
        }
      },
    )
  }
}
