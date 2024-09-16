import { PreprocessingHandler } from './server/assets/queues/PreprocessingHandler'
import { createUserOnWorkspaceContext } from './server/auth/userOnWorkspaceContext'
import { prisma } from './server/db'

async function main() {
  const workspace = await prisma.workspace.findFirstOrThrow()
  const user = await prisma.user.findFirstOrThrow()
  const asset = await prisma.asset.findFirstOrThrow({
    orderBy: { createdAt: 'desc' },
  })

  const context = await createUserOnWorkspaceContext(
    prisma,
    workspace.id,
    user.id,
  )
  const pphandler = new PreprocessingHandler(prisma, context)
  return pphandler.run(asset.id)
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit(0))
