import { env } from '@/env.mjs'
import {
  AbstractAppEngine,
  type AppEngineParams,
} from '@/server/ai/lib/AbstractAppEngine'
import { AppEngineResponseStream } from '@/server/ai/lib/AppEngineResponseStream'
import type { AiRegistryMessage } from '@/server/lib/ai-registry/aiRegistryTypes'
import OpenAI from 'openai'

type AiRegistryMessageWithoutSystemRole = Omit<AiRegistryMessage, 'role'> & {
  role: Exclude<AiRegistryMessage['role'], 'system'>
}

export class OpenaiAssistantsEngine extends AbstractAppEngine {
  getName() {
    return 'OpenaiAssistantsEngine'
  }

  async run({ ctx, messages }: AppEngineParams) {
    const openai = new OpenAI({
      // This needs to be provided at runtime
      apiKey: env.INTERNAL_OPENAI_API_KEY,
    })

    const messagesWithoutSystem = messages.map((message) => {
      if (message.role !== 'system') {
        return message as AiRegistryMessageWithoutSystemRole
      }
      return {
        ...message,
        role: 'user',
      } as AiRegistryMessageWithoutSystemRole
    })

    const thread = await openai.beta.threads.create({
      messages: messagesWithoutSystem,
    })
    const threadId = thread.id

    const createdMessage = await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: 'Say "Hi workl"',
    })

    return AppEngineResponseStream(
      {
        threadId,
        messageId: createdMessage.id,
      },

      async ({ forwardStream }) => {
        const streamAsAsyncIterable = openai.beta.threads.runs.stream(
          threadId,
          {
            assistant_id: 'asst_sk18bpznVq02EKXulK5S3X8L',
          },
        )

        await forwardStream(streamAsAsyncIterable)
      },
    )
  }
}
