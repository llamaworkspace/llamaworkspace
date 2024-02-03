export interface NewChatProps {
  postId?: string
  chatId?: string
  onSuccess: () => void
}

export interface CreateNewChatProps extends NewChatProps {
  loading?: boolean
}
