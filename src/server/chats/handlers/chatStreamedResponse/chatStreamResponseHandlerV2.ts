import { OpenaiAssistantRunner } from '@/runners/OpenAiAssistantRunner'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  chatId: z.string(),
  messages: z.array(
    z.object({
      role: z.string(),
      content: z.string(),
    }),
  ),
})

type RequestBody = z.infer<typeof schema>

const body = {
  messages: [
    {
      role: 'user',
      content: '',
    },
  ],
  chatId: 'clw9ag77700b712erku3q6zat',
}

// Request type=oai_assistant
// Pick the right strategy based on the chatId
// Bring the runtime parameters from the database
// Run the strategy, which will return a stream of messages

export default async function chatStreamedResponseHandlerV2(req: NextRequest) {
  const strategy = new OpenaiAssistantRunner()

  return strategy.stream()
}
