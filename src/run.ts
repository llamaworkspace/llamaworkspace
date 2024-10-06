import { createUserOnWorkspaceContext } from './server/auth/userOnWorkspaceContext'
import { prisma } from './server/db'
import { ragIngestService } from './server/rag/services/ragIngestService'

async function main() {
  const workspace = await prisma.workspace.findFirstOrThrow({
    include: {
      users: true,
    },
  })

  const workspaceUser = workspace?.users[0]!

  const context = await createUserOnWorkspaceContext(
    prisma,
    workspace.id,
    workspaceUser.userId,
  )

  const assetOnApp = await prisma.assetsOnApps.findFirstOrThrow({
    include: {
      asset: true,
    },
  })

  return await ragIngestService(prisma, context, {
    filePath: assetOnApp.asset.path,
    assetOnAppId: assetOnApp.id,
  })
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => {
    process.exit(0)
  })
