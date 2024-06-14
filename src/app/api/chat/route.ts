import chatStreamedResponseHandlerV2 from '@/server/chats/handlers/chatStreamedResponse/chatStreamResponseHandlerV2'
import type { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 300 // 5 minutes

export async function POST(req: NextRequest, res: NextResponse) {
  return await chatStreamedResponseHandlerV2(req, res)
}
