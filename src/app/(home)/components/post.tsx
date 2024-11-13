'use client'

import { Suspense, useState } from 'react'

import { api } from '@/trpc/react'

export function LatestPost() {
  const [latestPost] = api.post.getLatest.useSuspenseQuery()

  const utils = api.useUtils()
  const [name, setName] = useState('')
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate()
      setName('')
    },
  })

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.title}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          createPost.mutate({ name })
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-full px-4 py-2 text-black"
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}

function PostSkeleton() {
  return (
    <div className="w-full max-w-2xl">
      <h2 className="mb-4 text-2xl font-bold">All Posts</h2>
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((_, i) => (
          <div key={i} className="rounded-lg bg-white/10 p-4 transition-colors">
            <div className="h-8 w-3/4 animate-pulse rounded bg-white/20" />
            <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-white/20" />
          </div>
        ))}
      </div>
    </div>
  )
}

function PostsList() {
  const [posts] = api.post.getAll.useSuspenseQuery()

  if (!posts.length) return <div>No posts found</div>

  return (
    <div className="w-full max-w-2xl">
      <h2 className="mb-4 text-2xl font-bold">All Posts</h2>
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-lg bg-white/10 p-4 transition-colors hover:bg-white/20"
          >
            <div className="text-2xl">{post.title}</div>
            <div className="text-gray-300" suppressHydrationWarning>
              {post.createdAt.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Posts() {
  return (
    <Suspense fallback={<PostSkeleton />}>
      <PostsList />
    </Suspense>
  )
}
