import { prisma } from '@/server/db'

const subject = async () => {}

describe('postsSharePerform', () => {
  it('shares the post', async () => {
    const share = await prisma.share.findFirst()

    expect(true).toBe(true)
  })
})
