import { AssistantResponse, type AssistantMessage, type DataMessage } from 'ai'
import { type AssistantStream } from 'openai/lib/AssistantStream'
import { type Run } from 'openai/resources/beta/threads/runs/runs'

type AiLibAssistantResponseCallbackArgs = {
  sendMessage: (message: AssistantMessage) => void
  sendDataMessage: (message: DataMessage) => void
  forwardStream: (stream: AssistantStream) => Promise<Run | undefined>
}

type AiLibAssistantResponseCallback = (
  options: AiLibAssistantResponseCallbackArgs,
) => Promise<void>

type AppEngineResponseStreamProcessArgs = (
  options: Omit<AiLibAssistantResponseCallbackArgs, 'forwardStream'> & {
    /**
  Append text to the current message in the UI. Streams the message.
   */
    sendTextMessageChunk: (message: string) => void
    /**
  Forwards the assistant response stream to the client. Returns the `Run` object after it completes, or when it requires an action.
     */
    forwardOpenAiAssistantsStream: (
      stream: AssistantStream,
    ) => Promise<Run | undefined>
  },
) => Promise<void>

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
  process: AppEngineResponseStreamProcessArgs,
) => {
  const processFunc: AiLibAssistantResponseCallback = async ({
    sendMessage,
    sendDataMessage,
    forwardStream,
  }) => {
    const sendTextMessageChunk = (text: string) => {
      console.log(1)
    }

    await process({
      sendMessage,
      sendDataMessage,
      sendTextMessageChunk,
      forwardOpenAiAssistantsStream: forwardStream,
    })
  }

  const response = AssistantResponse(responseSettings, processFunc)

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
