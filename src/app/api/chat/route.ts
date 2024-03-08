import { chatStreamedResponseHandler } from '@/server/chats/handlers/chatStreamedResponse/chatStreamedResponseHandler'

// Optional, but recommended: run on the edge runtime.
// See https://vercel.com/docs/concepts/functions/edge-functions
// export const runtime = 'edge'

export async function POST(req: Request) {
  return await chatStreamedResponseHandler(req)
}
