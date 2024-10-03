import { chatStreamedResponseHandler } from '@/server/chats/handlers/chatStreamedResponse/chatStreamedResponseHandler'
import type { NextRequest } from 'next/server'

export const maxDuration = 300 // 5 minutes

export async function POST(req: NextRequest) {
  return await chatStreamedResponseHandler(req)
}
