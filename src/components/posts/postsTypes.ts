import type { RootRouter } from '@/server/trpc/rootRouter'
import type { inferRouterInputs } from '@trpc/server'

type RouterInput = inferRouterInputs<RootRouter>

export type PostCreateInput = RouterInput['posts']['create']

export type PostUpdateInput = RouterInput['posts']['update']
export type PostUpdateParams = Omit<PostUpdateInput, 'id'>

export interface ComponentWithPostId {
  postId: string
}

export enum PostType {
  Chat = 'chat',
}

export enum AppGptEngine {
  Basic = 'basic',
  OpenaiAssistant = 'openai_assistant',
}
