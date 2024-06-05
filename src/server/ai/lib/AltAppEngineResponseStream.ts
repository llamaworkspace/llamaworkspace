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
  pushMessage: (message: string) => void
  doThing: () => Promise<void>
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

class MyAss extends AssistantStream {
  public run(cb: () => Promise<unknown>) {
    this._run(cb)
  }
}

export const AltAppEngineResponseStream = (
  responseSettings: AssistantResponseSettings,
  process: AppEngineResponseStreamProcessArgs,
) => {
  const processFunc: AiLibAssistantResponseCallback = async ({
    sendMessage,
    sendDataMessage,
    forwardStream,
  }) => {
    const pushMessage = (text: string) => {}
    const doThing = async () => {
      const readable = new ReadableStream({
        start(controller) {
          setTimeout(() => {
            controller.enqueue(encodePayload(threadMessageCreated))

            setTimeout(() => {
              controller.enqueue(encodePayload(threadMessageDelta))
              controller.enqueue(encodePayload(threadMessageDelta))
              controller.enqueue(encodePayload(threadRunCompleted))
              controller.close()
            }, 500)
          }, 500)
        },
      })
      const stream = AssistantStream.fromReadableStream(readable)
      await forwardStream(stream)
    }

    await process({
      pushMessage,
      doThing,
    })
  }
  const secondArg = {
    onToken: () => {},
    onFinal: () => {},
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

const encodePayload = (payload: unknown) => {
  return `${JSON.stringify(payload)}\n`
}

const threadMessageCreated = {
  event: 'thread.message.created',
  data: {
    id: 'msg_hZwwQq26IJyBgVwpNL4zQ70n',
    object: 'thread.message',
    created_at: 1717587669,
    assistant_id: 'asst_sk18bpznVq02EKXulK5S3X8L',
    thread_id: 'thread_wdxQGrIarwdoEhDcIqaT9ENz',
    run_id: 'run_DVrpDjFkMBkfAtLp0LpK3AxV',
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

const threadMessageDelta = {
  event: 'thread.message.delta',
  data: {
    id: 'msg_hZwwQq26IJyBgVwpNL4zQ70n',
    object: 'thread.message.delta',
    delta: {
      content: [
        {
          type: 'text',
          text: {
            value: 'hhhooeleleleleelel',
          },
        },
      ],
    },
  },
}

const threadRunCompleted = {
  event: 'thread.run.completed',
  data: {
    id: 'run_DVrpDjFkMBkfAtLp0LpK3AxV',
    object: 'thread.run',
    created_at: 1717587668,
    assistant_id: 'asst_sk18bpznVq02EKXulK5S3X8L',
    thread_id: 'thread_wdxQGrIarwdoEhDcIqaT9ENz',
    status: 'completed',
    // started_at: 1717587668,
    // expires_at: null,
    // cancelled_at: null,
    // failed_at: null,
    // completed_at: 1717587669,
    // required_action: null,
    // last_error: null,
    // model: 'gpt-3.5-turbo',
    // instructions: '',
    // tools: [],
    // tool_resources: { code_interpreter: [] },
    // metadata: {},
    // temperature: 1,
    // top_p: 1,
    // max_completion_tokens: null,
    // max_prompt_tokens: null,
    // truncation_strategy: { type: 'auto', last_messages: null },
    // incomplete_details: null,
    // usage: { prompt_tokens: 21, completion_tokens: 5, total_tokens: 26 },
    // response_format: 'auto',
    // tool_choice: 'auto',
  },
}
