import type { RouterInputs } from '@/lib/api'
import { postCreateService } from '@/server/posts/services/postCreate.service'
import mockDb from '@/server/testing/mockDb'
import { trpcContextSetupHelper } from '@/server/testing/trpcContextSetupHelper'

type SubjectPayload = RouterInputs['posts']['create']
type MockedPostCreateService = jest.MockedFunction<typeof postCreateService>

jest.mock('@/server/posts/services/postCreate.service')

const userId = 'user_abc123'
const workspaceId = 'workspace_zyx987'

describe('postsCreate', () => {
  beforeEach(() => {
    ;(postCreateService as MockedPostCreateService).mockClear()
  })

  const subject = async (payload: SubjectPayload) => {
    const { caller } = trpcContextSetupHelper(mockDb, userId)
    await caller.posts.create(payload)
  }

  it('calls postCreateService with proper params', async () => {
    await subject({ title: 'Test title', workspaceId })
    expect(postCreateService).toHaveBeenCalledWith(
      mockDb,
      workspaceId,
      userId,
      {
        title: 'Test title',
      },
    )
  })

  it('when no title provided, it sets title as undefined ', async () => {
    await subject({ workspaceId })

    expect(postCreateService).toHaveBeenCalledWith(
      mockDb,
      workspaceId,
      userId,
      {
        title: undefined,
      },
    )
  })
})
