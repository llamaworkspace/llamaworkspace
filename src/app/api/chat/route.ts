import { chatStreamedResponseHandler } from '@/server/chats/handlers/chatStreamedResponse/chatStreamedResponseHandler'

export const maxDuration = 180 // 3 minutes

export async function POST(req: Request) {
  return await chatStreamedResponseHandler(req)
}
