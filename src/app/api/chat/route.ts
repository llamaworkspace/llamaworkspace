import { chatStreamedResponseHandler } from '@/server/chats/handlers/chatStreamedResponse/chatStreamedResponseHandler'

export async function POST(req: Request) {
  return await chatStreamedResponseHandler(req)
}
