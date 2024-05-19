import { env } from '@/env.mjs'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

export class OpenaiAssistantRunner implements Strategy {
  async stream() {
    const openai = new OpenAI({ apiKey: env.INTERNAL_OPENAI_API_KEY })
    // Simulate SSE messages stream response

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'What is the meaning of life?',
        },
      ],
      stream: true,
      max_tokens: 5,
    })

    const stream = OpenAIStream(aiResponse, {
      onToken: console.log,
      // onFinal: payload?.onFinal,
    })

    const headers = {
      'Content-Type': 'text/event-stream',
    }
    return new StreamingTextResponse(stream, { headers })
  }
}

interface Strategy {
  stream(): Promise<unknown>
}
