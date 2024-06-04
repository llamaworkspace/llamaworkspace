import type { RootRouter } from '@/server/trpc/rootRouter'
import type { inferRouterInputs } from '@trpc/server'

type RouterInput = inferRouterInputs<RootRouter>

export type AppCreateInput = RouterInput['apps']['create']

export type AppUpdateInput = RouterInput['apps']['update']
export type AppUpdateParams = Omit<AppUpdateInput, 'id'>

export interface ComponentWithAppId {
  appId: string
}

export enum AppType {
  Chat = 'chat',
  Assistant = 'assistant',
}

export enum AppGptEngine {
  Basic = 'basic',
  OpenaiAssistant = 'openai_assistant',
}
