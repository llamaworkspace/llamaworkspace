import { postVisibilityFilter } from '@/components/posts/backend/postsBackendUtils'

export function chatVisibilityFilter(userId: string) {
  return {
    authorId: userId,
    post: {
      ...postVisibilityFilter(userId),
    },
  }
}

// TODO: After adding delete filter, add "isDefault: false" as a check there
export function chatEditionFilter(userId: string) {
  return chatVisibilityFilter(userId)
}
