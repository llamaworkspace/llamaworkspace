import { AppEngineRunner } from '@/server/ai/lib/AppEngineRunner'
import { prisma } from '@/server/db'
import { enginesRegistry } from '@/server/extensions/appEngines/appEngines'

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

const assistantsSchema = z.object({
  threadId: z.string().nullable(),
  message: z.string(),
  data: z.object({
    chatId: z.string(),
  }),
})

type RequestBody = z.infer<typeof assistantsSchema>

export default async function chatStreamedResponseHandlerV2(req: NextRequest) {
  const appEngineRunner = new AppEngineRunner(prisma, enginesRegistry)
  const body = (await req.json()) as RequestBody

  // return await appEngineRunner.call(body.chatId)
  return await appEngineRunner.call(body.data.chatId)
}
