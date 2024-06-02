import type { RootRouter } from '@/server/trpc/rootRouter'
import type { inferRouterInputs } from '@trpc/server'

type RouterInput = inferRouterInputs<RootRouter>

export type PostCreateInput = RouterInput['apps']['create']

export type PostUpdateInput = RouterInput['apps']['update']
export type PostUpdateParams = Omit<PostUpdateInput, 'id'>

export interface ComponentWithPostId {
  appId: string
}

export enum PostType {
  Chat = 'chat',
}

export enum AppGptEngine {
  Basic = 'basic',
  OpenaiAssistant = 'openai_assistant',
}
