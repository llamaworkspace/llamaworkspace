import { PostConfigForGPT } from './PostConfigForGPT/PostConfigForGPT'

interface PostConfigProps {
  postId?: string
}

export function PostConfig({ postId }: PostConfigProps) {
  return <PostConfigForGPT postId={postId} />
}
