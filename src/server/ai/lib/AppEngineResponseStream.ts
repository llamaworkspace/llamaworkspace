import { ensureError } from '@/lib/utils'
import { AssistantResponse, type AssistantMessage, type DataMessage } from 'ai'
import { AssistantStream } from 'openai/lib/AssistantStream'
import { type Run } from 'openai/resources/beta/threads/runs/runs'

type AiLibAssistantResponseCallbackArgs = {
  sendMessage: (message: AssistantMessage) => void
  sendDataMessage: (message: DataMessage) => void
  forwardStream: (stream: AssistantStream) => Promise<Run | undefined>
}

type AiLibAssistantResponseCallback = (
  options: AiLibAssistantResponseCallbackArgs,
) => Promise<void>

type AppEngineResponseStreamProcessArgs = (options: {
  pushText: (text: string) => void
}) => Promise<void>

type AssistantResponseSettings = {
  /**
  The thread ID that the response is associated with.
     */
  threadId: string
  /**
  The ID of the chat run
   */
  chatRunId: string
  /**
  The ID of the latest message that the response is associated with.
   */
  messageId: string
}

export const AppEngineResponseStream = (
  responseSettings: AssistantResponseSettings,
  process: AppEngineResponseStreamProcessArgs,
) => {
  const { threadId, chatRunId, messageId } = responseSettings

  const processFunc: AiLibAssistantResponseCallback = async ({
    sendMessage,
    sendDataMessage,
    forwardStream,
  }) => {
    const readable = new ReadableStream({
      async start(controller) {
        // Define the method to be passed downstream
        // that will push text strings to the client
        const pushText = (text: string) => {
          const threadMessageDelta = generateThreadMessageDelta(messageId, text)
          controller.enqueue(encodePayload(threadMessageDelta))
        }

        try {
          // Before starting, generate and push a threadMessage
          const threadMessageCreated = generateThreadMessageCreated(
            threadId,
            chatRunId,
            messageId,
          )

          controller.enqueue(encodePayload(threadMessageCreated))

          // Run the implementation
          await process({
            pushText,
          })

          // Push completion
          const threadRunCompleted = generateThreadRunCompleted(
            threadId,
            chatRunId,
          )

          controller.enqueue(encodePayload(threadRunCompleted))

          // Close the stream
          controller.close()
        } catch (_error) {
          controller.error(ensureError(_error))
        }
      },
    })

    const stream = AssistantStream.fromReadableStream(readable)
    await forwardStream(stream)
  }

  const response = AssistantResponse({ threadId, messageId }, processFunc)

  if (!response.body) {
    throw new Error('Response body is missing in AppEngineResponseStream')
  }

  return response.body
}

const encodePayload = (payload: unknown) => {
  return `${JSON.stringify(payload)}\n`
}

const generateThreadMessageCreated = (
  threadId: string,
  chatRunId: string,
  messageId: string,
) => {
  return {
    event: 'thread.message.created',
    data: {
      id: messageId,
      object: 'thread.message',
      created_at: Math.floor(new Date().getTime() / 1000),
      assistant_id: 'null',
      thread_id: threadId,
      run_id: chatRunId,
      status: 'in_progress',
      incomplete_details: null,
      incomplete_at: null,
      completed_at: null,
      role: 'assistant',
      content: [],
      attachments: [],
      metadata: {},
    },
  }
}

const generateThreadMessageDelta = (messageId: string, text: string) => {
  return {
    event: 'thread.message.delta',
    data: {
      id: messageId,
      object: 'thread.message.delta',
      delta: {
        content: [
          {
            type: 'text',
            text: {
              value: text,
            },
          },
        ],
      },
    },
  }
}

const generateThreadRunCompleted = (threadId: string, chatRunId: string) => {
  return {
    event: 'thread.run.completed',
    data: {
      id: chatRunId,
      object: 'thread.run',
      created_at: Math.floor(new Date().getTime() / 1000),
      assistant_id: 'null',
      thread_id: threadId,
      status: 'completed',
    },
  }
}
