import { experimental_assistantStreamedResponseHandler } from '@/server/chats/handlers/chatStreamedResponse/experimental_assistantStreamedResponseHandler'

export const maxDuration = 300 // 5 minutes

export async function POST(req: Request) {
  return await experimental_assistantStreamedResponseHandler(req)
}
