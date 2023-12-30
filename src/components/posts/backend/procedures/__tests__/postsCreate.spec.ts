import type { RouterInputs } from '@/lib/api'
import { postCreateRepo } from '@/server/posts/repositories/postsCreateRepo'
import mockDb from '@/server/testing/mockDb'
import { rootRouter } from '@/server/trpc/rootRouter'
import { createInnerTRPCContext } from '@/server/trpc/trpc'

type SubjectPayload = RouterInputs['posts']['create']
type MockedPostCreateRepo = jest.MockedFunction<typeof postCreateRepo>

jest.mock('@/server/posts/repositories/postsCreateRepo')

const userId = 'user_abc123'
const workspaceId = 'workspace_zyx987'

describe('postsCreate', () => {
  beforeEach(() => {
    ;(postCreateRepo as MockedPostCreateRepo).mockClear()
  })

  const subject = async (payload: SubjectPayload) => {
    const session = {
      user: { id: userId, name: 'John Doe' },
      expires: '1',
    }

    const ctx = createInnerTRPCContext({
      session,
    })
    const caller = rootRouter.createCaller({ ...ctx, prisma: mockDb })
    await caller.posts.create(payload)
  }

  it('calls postCreateRepo with proper params', async () => {
    await subject({ title: 'Test title', workspaceId })
    expect(postCreateRepo).toHaveBeenCalledWith(mockDb, workspaceId, userId, {
      title: 'Test title',
    })
  })

  it('when no title provided, it sets title as undefined ', async () => {
    await subject({ workspaceId })

    expect(postCreateRepo).toHaveBeenCalledWith(mockDb, workspaceId, userId, {
      title: undefined,
    })
  })
})
