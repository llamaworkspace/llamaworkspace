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
      content: 'Say "soy juan el del Assistant"',
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
            console.log('message', message)
            sendMessage({
              id: messageId,
              role: 'assistant',
              content: message.data.delta.content?.map((content) => {
                const _content =
                  content as OpenAI.Beta.Threads.Messages.TextDeltaBlock
                console.log('content11', _content.text)
                return {
                  type: content.type,
                  text: { value: _content.text?.value },
                }
              }),
            })
          }
        }

        // await forwardStream(streamAsAsyncIterable)
      },
    )
  }
}
