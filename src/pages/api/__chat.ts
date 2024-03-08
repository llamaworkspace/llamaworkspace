import chatStreamedResponseHandler from '@/server/chats/handlers/chatStreamedResponse/chatStreamedResponseHandler'

export default chatStreamedResponseHandler

export const config = {
  api: {
    externalResolver: true,
  },
}
