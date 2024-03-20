import { chatStreamedResponseHandler } from '@/server/chats/handlers/chatStreamedResponse/chatStreamedResponseHandler'

export const maxDuration = 500 // 5 minutes

export async function POST(req: Request) {
  return await chatStreamedResponseHandler(req)
}
