import { PostFactory } from '@/server/testing/factories/PostFactory'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import mockDb from '@/server/testing/mockDb'
import { faker } from '@faker-js/faker'
import { updatePostSortingService } from '../updatePostSorting.service'
import { updatePostSortingForNonNullPreviousId } from '../updatePostSorting/updatePostSortingForNonNullPreviousId.service'
import { updatePostSortingForNullPreviousId } from '../updatePostSorting/updatePostSortingForNullPreviousId.service'

jest.mock(
  '@/server/posts/services/updatePostSorting/updatePostSortingForNonNullPreviousId.service',
)
jest.mock(
  '@/server/posts/services/updatePostSorting/updatePostSortingForNullPreviousId.service',
)

describe('updatePostSortingService', () => {
  const subject = async (withPreviousPostId?: boolean) => {
    const user = UserFactory.build({ id: faker.string.nanoid() })
    const previousPost = PostFactory.build({ userId: user.id })
    const post = PostFactory.build({ userId: user.id })

    await updatePostSortingService(
      mockDb,
      user.id,
      post.id,
      withPreviousPostId ? previousPost.id : null,
    )
  }
  describe('when previousPostId is null', () => {
    it('executes updatePostSortingForNullPreviousId service', async () => {
      await subject()
      expect(updatePostSortingForNullPreviousId).toHaveBeenCalled()
    })
  })

  describe('when previousPostId is passed', () => {
    it('executes updatePostSortingForNonNullPreviousId service', async () => {
      await subject(true)
      expect(updatePostSortingForNonNullPreviousId).toHaveBeenCalled()
    })
  })
})
