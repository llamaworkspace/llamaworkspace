import { AssistantResponse } from 'ai'

type AssistantResponseArgs = Parameters<typeof AssistantResponse>

export const MyAssistantResponse = (...args: AssistantResponseArgs) => {
  const response = AssistantResponse(...args)

  if (!response.body) {
    throw new Error('Response body is missing')
  }

  const reader = response.body.getReader()
  const nextReadableStream = new ReadableStream({
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

  return nextReadableStream
}
