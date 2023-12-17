import { prisma } from '@/server/db'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { onboardingCreateService } from '../onboardingCreate.service'
import { onboardingTexts } from '../onboardingTexts'

describe('onboardingCreate', () => {
  const subject = async () => {
    const workspace = await WorkspaceFactory.create(prisma)
    const user = await UserFactory.create(prisma, { workspaceId: workspace.id })
    await onboardingCreateService(prisma, workspace.id, user.id)
    return user
  }

  it('creates a default post', async () => {
    const user = await subject()

    const post = await prisma.post.findFirstOrThrow({
      where: {
        userId: user.id,
      },
    })

    expect(post).toMatchObject({
      title: "Joia's fun facts teller",
    })
  })

  it.skip('creates the default instructions', async () => {
    const user = await subject()

    const postConfigVersion = await prisma.postConfigVersion.findFirstOrThrow({
      where: {
        post: {
          postShares: {
            some: {
              userId: user.id,
            },
          },
        },
      },
    })

    expect(postConfigVersion).toMatchObject({
      initialMessage: onboardingTexts.initialMessage,
    })
  })

  it('creates the default system message', async () => {
    const user = await subject()

    const message = await prisma.message.findFirstOrThrow({
      where: {
        postConfigVersion: {
          post: {
            userId: user.id,
          },
        },
      },
    })

    expect(message).toMatchObject({
      message: onboardingTexts.systemMessage,
    })
  })
})
