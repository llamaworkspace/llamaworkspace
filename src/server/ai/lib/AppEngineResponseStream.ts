import { AssistantResponse, type AssistantMessage, type DataMessage } from 'ai'
import { type AssistantStream } from 'openai/lib/AssistantStream'
import { type Run } from 'openai/resources/beta/threads/runs/runs'

type AssistantResponseCallback = (options: {
  /**
  @deprecated use variable from outer scope instead.
     */
  threadId: string
  /**
  @deprecated use variable from outer scope instead.
     */
  messageId: string
  /**
  Forwards an assistant message (non-streaming) to the client.
     */
  sendMessage: (message: AssistantMessage) => void
  /**
  Send a data message to the client. You can use this to provide information for rendering custom UIs while the assistant is processing the thread.
   */
  sendDataMessage: (message: DataMessage) => void
  /**
  Forwards the assistant response stream to the client. Returns the `Run` object after it completes, or when it requires an action.
     */
  forwardStream: (stream: AssistantStream) => Promise<Run | undefined>
}) => Promise<void>

type AssistantResponseSettings = {
  /**
  The thread ID that the response is associated with.
     */
  threadId: string
  /**
  The ID of the latest message that the response is associated with.
   */
  messageId: string
}

export const AppEngineResponseStream = (
  responseSettings: AssistantResponseSettings,
  process: AssistantResponseCallback,
) => {
  const response = AssistantResponse(responseSettings, process)

  if (!response.body) {
    throw new Error('Response body is missing in AppEngineResponseStream')
  }

  const reader = response.body.getReader()
  return new ReadableStream({
    async start(controller) {
      while (true) {
        const { done, value } = await reader.read()
        const chunkText = new TextDecoder().decode(value)
        console.log('chunkText', done, chunkText)
        if (done) {
          controller.close()
          return
        }
        controller.enqueue(value)
      }
    },
  })
}
