import type { RootRouter } from '@/server/trpc/rootRouter'
import type { Post, PostSort, Prisma } from '@prisma/client'
import type { inferRouterInputs } from '@trpc/server'

export type PostWithChatIds = Prisma.PostGetPayload<{
  include: {
    chats: { select: { id: true; createdAt: true } }
  }
}>

type RouterInput = inferRouterInputs<RootRouter>

export type PostCreateInput = RouterInput['posts']['create']

export type PostUpdateInput = RouterInput['posts']['update']
export type PostUpdateParams = Omit<PostUpdateInput, 'id'>

export interface ComponentWithPostId {
  postId: string
}

export type PostSortWithPost = PostSort & { post: Post }
