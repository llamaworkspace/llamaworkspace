import { ensureError } from '@/lib/utils'
import type { AssistantStream } from 'openai/lib/AssistantStream'
import type { Run } from 'openai/resources/beta/threads/runs/runs'

type JSONValue =
  | null
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>

type AssistantMessage = {
  id: string
  role: 'assistant'
  content: Array<{
    type: 'text'
    text: {
      value: string
    }
  }>
}

/*
 * A data message is an application-specific message from the assistant
 * that should be shown in order with the other messages.
 *
 * It can trigger other operations on the frontend, such as annotating
 * a map.
 */
type DataMessage = {
  id?: string // optional id, implement if needed (e.g. for persistance)
  role: 'data'
  data: JSONValue // application-specific data
}

/**
You can pass the thread and the latest message into the `AssistantResponse`. This establishes the context for the response.
 */
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

/**
The process parameter is a callback in which you can run the assistant on threads, and send messages and data messages to the client.
 */
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
Forwards a plain text message to the client.
   */
  sendTextMessage: (textMessage: string) => void

  /**
Send a data message to the client. You can use this to provide information for rendering custom UIs while the assistant is processing the thread.
 */
  sendDataMessage: (message: DataMessage) => void

  /**
Forwards the assistant response stream to the client. Returns the `Run` object after it completes, or when it requires an action.
   */
  forwardStream: (stream: AssistantStream) => Promise<Run | undefined>
}) => Promise<void>

/**
The `AssistantResponse` allows you to send a stream of assistant update to `useAssistant`.
It is designed to facilitate streaming assistant responses to the `useAssistant` hook.
It receives an assistant thread and a current message, and can send messages and data messages to the client.
 */
export function CustomAssistantResponse(
  { threadId, messageId }: AssistantResponseSettings,
  {
    onToken,
    onFinal,
  }: { onToken: (token: string) => void; onFinal: (content: string) => void },
  process: AssistantResponseCallback,
): ReadableStream<unknown> {
  return new ReadableStream({
    async start(controller) {
      const textEncoder = new TextEncoder()

      const sendMessage = (message: AssistantMessage) => {
        controller.enqueue(
          textEncoder.encode(formatStreamPart('assistant_message', message)),
        )
      }

      const sendTextMessage = (value: string) => {
        console.log('sendTextMessage', value)
        controller.enqueue(textEncoder.encode(formatStreamPart('text', value)))
      }
      // const sendTextMessage = (value: string) => {
      //   fullValue += value
      //   sendMessage({
      //     id: Math.random().toString(36).slice(2),
      //     role: 'assistant',
      //     content: [{ type: 'text', text: { value: fullValue } }],
      //   })
      // }

      const sendDataMessage = (message: DataMessage) => {
        controller.enqueue(
          textEncoder.encode(formatStreamPart('data_message', message)),
        )
      }

      const sendError = (errorMessage: string) => {
        controller.enqueue(
          textEncoder.encode(formatStreamPart('error', errorMessage)),
        )
      }

      const forwardStream = async (stream: AssistantStream) => {
        let result: Run | undefined = undefined

        for await (const value of stream) {
          // console.log('value', value)
          // if (value.event === 'thread.run.step.delta') {
          //   console.log('thread.run.step.delta', value.data.delta)
          // }
          // if (value.data.type === 'message_creation') {
          //   console.log('message_creation', value.data.step_details)
          // }
          if (value.event === 'thread.message.delta') {
            const {
              data: { delta },
            } = value

            delta.content?.forEach((content) => {
              if (content.type === 'text') {
                if (content.text?.value) {
                  onToken(content.text.value)
                  console.log(
                    'thread.message.delta',
                    content.text?.value,
                    content.text?.annotations,
                  )
                }
              }
            })
          }

          if (value.event === 'thread.message.completed') {
            const {
              data: { content },
            } = value

            content?.forEach((content) => {
              if (content.type === 'text') {
                if (content.text?.value) {
                  onFinal(content.text.value)
                  console.log(
                    'thread.message.completed',
                    content.text?.value,
                    content.text?.annotations,
                  )
                }
              }
            })
          }

          switch (value.event) {
            case 'thread.message.created': {
              console.log(
                'aaaa',
                formatStreamPart('assistant_message', {
                  id: value.data.id,
                  role: 'assistant',
                  content: [{ type: 'text', text: { value: '' } }],
                }),
              )
              controller.enqueue(
                textEncoder.encode(
                  formatStreamPart('assistant_message', {
                    id: value.data.id,
                    role: 'assistant',
                    content: [{ type: 'text', text: { value: '' } }],
                  }),
                ),
              )
              break
            }

            case 'thread.message.delta': {
              const content = value.data.delta.content?.[0]

              if (content?.type === 'text' && content.text?.value != null) {
                console.log(
                  'bbbbb',
                  formatStreamPart('text', content.text.value),
                )
                controller.enqueue(
                  textEncoder.encode(
                    formatStreamPart('text', content.text.value),
                  ),
                )
              }

              break
            }

            case 'thread.run.completed':
            case 'thread.run.requires_action': {
              result = value.data
              break
            }
          }
        }

        return result
      }

      // send the threadId and messageId as the first message:
      controller.enqueue(
        textEncoder.encode(
          formatStreamPart('assistant_control_data', {
            threadId,
            messageId,
          }),
        ),
      )

      try {
        await process({
          threadId,
          messageId,
          sendMessage,
          sendTextMessage,
          sendDataMessage,
          forwardStream,
        })
      } catch (_error) {
        const error = ensureError(_error)
        sendError(error.message)
      } finally {
        controller.close()
      }
    },
    // pull(controller) {
    // },
    // cancel() {
    // },
  })
}

interface StreamPart<CODE extends string, NAME extends string, TYPE> {
  code: CODE
  name: NAME
  parse: (value: JSONValue) => { type: NAME; value: TYPE }
}

const textStreamPart: StreamPart<'0', 'text', string> = {
  code: '0',
  name: 'text',
  parse: (value: JSONValue) => {
    if (typeof value !== 'string') {
      throw new Error('"text" parts expect a string value.')
    }
    return { type: 'text', value }
  },
}

export interface FunctionCall {
  /**
   * The arguments to call the function with, as generated by the model in JSON
   * format. Note that the model does not always generate valid JSON, and may
   * hallucinate parameters not defined by your function schema. Validate the
   * arguments in your code before calling your function.
   */
  arguments?: string

  /**
   * The name of the function to call.
   */
  name?: string
}

const functionCallStreamPart: StreamPart<
  '1',
  'function_call',
  { function_call: FunctionCall }
> = {
  code: '1',
  name: 'function_call',
  parse: (value: JSONValue) => {
    if (
      value == null ||
      typeof value !== 'object' ||
      !('function_call' in value) ||
      typeof value.function_call !== 'object' ||
      value.function_call == null ||
      !('name' in value.function_call) ||
      !('arguments' in value.function_call) ||
      typeof value.function_call.name !== 'string' ||
      typeof value.function_call.arguments !== 'string'
    ) {
      throw new Error(
        '"function_call" parts expect an object with a "function_call" property.',
      )
    }

    return {
      type: 'function_call',
      value: value as unknown as { function_call: FunctionCall },
    }
  },
}

const dataStreamPart: StreamPart<'2', 'data', Array<JSONValue>> = {
  code: '2',
  name: 'data',
  parse: (value: JSONValue) => {
    if (!Array.isArray(value)) {
      throw new Error('"data" parts expect an array value.')
    }

    return { type: 'data', value }
  },
}

const errorStreamPart: StreamPart<'3', 'error', string> = {
  code: '3',
  name: 'error',
  parse: (value: JSONValue) => {
    if (typeof value !== 'string') {
      throw new Error('"error" parts expect a string value.')
    }
    return { type: 'error', value }
  },
}

const assistantMessageStreamPart: StreamPart<
  '4',
  'assistant_message',
  AssistantMessage
> = {
  code: '4',
  name: 'assistant_message',
  parse: (value: JSONValue) => {
    if (
      value == null ||
      typeof value !== 'object' ||
      !('id' in value) ||
      !('role' in value) ||
      !('content' in value) ||
      typeof value.id !== 'string' ||
      typeof value.role !== 'string' ||
      value.role !== 'assistant' ||
      !Array.isArray(value.content) ||
      !value.content.every(
        (item) =>
          item != null &&
          typeof item === 'object' &&
          'type' in item &&
          item.type === 'text' &&
          'text' in item &&
          item.text != null &&
          typeof item.text === 'object' &&
          'value' in item.text &&
          typeof item.text.value === 'string',
      )
    ) {
      throw new Error(
        '"assistant_message" parts expect an object with an "id", "role", and "content" property.',
      )
    }

    return {
      type: 'assistant_message',
      value: value as AssistantMessage,
    }
  },
}

const assistantControlDataStreamPart: StreamPart<
  '5',
  'assistant_control_data',
  {
    threadId: string
    messageId: string
  }
> = {
  code: '5',
  name: 'assistant_control_data',
  parse: (value: JSONValue) => {
    if (
      value == null ||
      typeof value !== 'object' ||
      !('threadId' in value) ||
      !('messageId' in value) ||
      typeof value.threadId !== 'string' ||
      typeof value.messageId !== 'string'
    ) {
      throw new Error(
        '"assistant_control_data" parts expect an object with a "threadId" and "messageId" property.',
      )
    }

    return {
      type: 'assistant_control_data',
      value: {
        threadId: value.threadId,
        messageId: value.messageId,
      },
    }
  },
}

const dataMessageStreamPart: StreamPart<'6', 'data_message', DataMessage> = {
  code: '6',
  name: 'data_message',
  parse: (value: JSONValue) => {
    if (
      value == null ||
      typeof value !== 'object' ||
      !('role' in value) ||
      !('data' in value) ||
      typeof value.role !== 'string' ||
      value.role !== 'data'
    ) {
      throw new Error(
        '"data_message" parts expect an object with a "role" and "data" property.',
      )
    }

    return {
      type: 'data_message',
      value: value as DataMessage,
    }
  },
}

/**
 * The tool calls generated by the model, such as function calls.
 */
export interface ToolCall {
  // The ID of the tool call.
  id: string

  // The type of the tool. Currently, only `function` is supported.
  type: string

  // The function that the model called.
  function: {
    // The name of the function.
    name: string

    // The arguments to call the function with, as generated by the model in JSON
    arguments: string
  }
}

const toolCallStreamPart: StreamPart<
  '7',
  'tool_calls',
  { tool_calls: ToolCall[] }
> = {
  code: '7',
  name: 'tool_calls',
  parse: (value: JSONValue) => {
    if (
      value == null ||
      typeof value !== 'object' ||
      !('tool_calls' in value) ||
      typeof value.tool_calls !== 'object' ||
      value.tool_calls == null ||
      !Array.isArray(value.tool_calls) ||
      value.tool_calls.some(
        (tc) =>
          tc == null ||
          typeof tc !== 'object' ||
          !('id' in tc) ||
          typeof tc.id !== 'string' ||
          !('type' in tc) ||
          typeof tc.type !== 'string' ||
          !('function' in tc) ||
          tc.function == null ||
          typeof tc.function !== 'object' ||
          !('arguments' in tc.function) ||
          typeof tc.function.name !== 'string' ||
          typeof tc.function.arguments !== 'string',
      )
    ) {
      throw new Error(
        '"tool_calls" parts expect an object with a ToolCallPayload.',
      )
    }

    return {
      type: 'tool_calls',
      value: value as unknown as { tool_calls: ToolCall[] },
    }
  },
}

const messageAnnotationsStreamPart: StreamPart<
  '8',
  'message_annotations',
  Array<JSONValue>
> = {
  code: '8',
  name: 'message_annotations',
  parse: (value: JSONValue) => {
    if (!Array.isArray(value)) {
      throw new Error('"message_annotations" parts expect an array value.')
    }

    return { type: 'message_annotations', value }
  },
}
const StreamStringPrefixes = {
  [textStreamPart.name]: textStreamPart.code,
  [functionCallStreamPart.name]: functionCallStreamPart.code,
  [dataStreamPart.name]: dataStreamPart.code,
  [errorStreamPart.name]: errorStreamPart.code,
  [assistantMessageStreamPart.name]: assistantMessageStreamPart.code,
  [assistantControlDataStreamPart.name]: assistantControlDataStreamPart.code,
  [dataMessageStreamPart.name]: dataMessageStreamPart.code,
  [toolCallStreamPart.name]: toolCallStreamPart.code,
  [messageAnnotationsStreamPart.name]: messageAnnotationsStreamPart.code,
} as const

type StreamString =
  `${(typeof StreamStringPrefixes)[keyof typeof StreamStringPrefixes]}:${string}\n`

// union type of all stream parts
type StreamParts =
  | typeof textStreamPart
  | typeof functionCallStreamPart
  | typeof dataStreamPart
  | typeof errorStreamPart
  | typeof assistantMessageStreamPart
  | typeof assistantControlDataStreamPart
  | typeof dataMessageStreamPart
  | typeof toolCallStreamPart
  | typeof messageAnnotationsStreamPart

/**
 * Maps the type of a stream part to its value type.
 */
type StreamPartValueType = {
  [P in StreamParts as P['name']]: ReturnType<P['parse']>['value']
}

const streamParts = [
  textStreamPart,
  functionCallStreamPart,
  dataStreamPart,
  errorStreamPart,
  assistantMessageStreamPart,
  assistantControlDataStreamPart,
  dataMessageStreamPart,
  toolCallStreamPart,
  messageAnnotationsStreamPart,
] as const

/**
Prepends a string with a prefix from the `StreamChunkPrefixes`, JSON-ifies it,
and appends a new line.

It ensures type-safety for the part type and value.
 */
function formatStreamPart<T extends keyof StreamPartValueType>(
  type: T,
  value: StreamPartValueType[T],
): StreamString {
  const streamPart = streamParts.find((part) => part.name === type)

  if (!streamPart) {
    throw new Error(`Invalid stream part type: ${type}`)
  }

  return `${streamPart.code}:${JSON.stringify(value)}\n`
}
