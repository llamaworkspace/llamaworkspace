import { uploadFileToAssistantHandler } from '@/server/chats/handlers/uploadFileToAssistant/uploadFileToAssistantHandler'

export const maxDuration = 300 // 5 minutes

export async function POST(req: Request) {
  return await uploadFileToAssistantHandler(req)
}
