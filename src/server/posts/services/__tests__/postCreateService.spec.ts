import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { postCreateService } from '@/server/posts/services/postCreate.service'
import { UserFactory } from '@/server/testing/factories/UserFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import { ShareScope } from '@/shared/globalTypes'

describe('postCreateService', () => {
  const input = { title: 'Test Post' }

  it('creates a new post', async () => {
    const workspace = await WorkspaceFactory.create(prisma)
    const user = await UserFactory.create(prisma, { workspaceId: workspace.id })
    const uowContext = await createUserOnWorkspaceContext(
      prisma,
      workspace.id,
      user.id,
    )
    await postCreateService(prisma, uowContext, input)

    const post = await prisma.post.findFirstOrThrow({
      where: {
        userId: user.id,
      },
    })

    expect(post).toMatchObject({
      title: 'Test Post',
    })
  })

  it('creates a new chat for the post', async () => {
    const workspace = await WorkspaceFactory.create(prisma)
    const user = await UserFactory.create(prisma, { workspaceId: workspace.id })
    const post = await postCreateService(prisma, workspace.id, user.id, input)

    const chat = await prisma.chat.findFirstOrThrow({
      where: {
        postId: post.id,
        authorId: user.id,
      },
    })

    expect(chat).toBeDefined()
  })

  it('creates an Everybody-based share for the post', async () => {
    const workspace = await WorkspaceFactory.create(prisma)
    const user = await UserFactory.create(prisma, { workspaceId: workspace.id })
    const post = await postCreateService(prisma, workspace.id, user.id, input)

    const share = await prisma.share.findMany({
      where: {
        postId: post.id,
      },
    })
    expect(share).toHaveLength(1)
    expect(share).toMatchObject([
      {
        postId: post.id,
        scope: ShareScope.Everybody,
      },
    ])
  })

  it('creates a first postConfigVersion', async () => {
    const weirdModel = 'a_weird_model'
    const workspace = await WorkspaceFactory.create(prisma)
    const user = await UserFactory.create(prisma, {
      defaultModel: weirdModel,
      workspaceId: workspace.id,
    })

    const post = await postCreateService(prisma, workspace.id, user.id, input)

    const postShare = await prisma.postConfigVersion.findFirstOrThrow({
      where: {
        postId: post.id,
      },
    })

    expect(postShare).toMatchObject({
      model: weirdModel,
    })
  })
})
