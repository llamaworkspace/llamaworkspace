export interface NewChatProps {
  postId?: string
  chatId?: string
  resetTextArea: () => void
}

export interface CreateNewChatProps extends NewChatProps {
  loading?: boolean
}
