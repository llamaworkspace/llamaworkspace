// To run, go to the server and invoke: npx tsx <path_to_this_file>
// NOTE: "tsx" (not "tsc")  !!
import { prisma } from '@/server/db'
import Bluebird from 'bluebird'

async function main() {
  const workspacesWithOpenAiKey = await prisma.workspace.findMany({
    select: {
      id: true,
      openAiApiKey: true,
    },
    where: {
      openAiApiKey: {
        not: null,
      },
    },
  })

  console.log(`Updating ${workspacesWithOpenAiKey.length} workspaces...`)

  await Bluebird.mapSeries(workspacesWithOpenAiKey, async (workspace) => {
    // Service to persist a providerMeta
    // await prisma.work.update({
    //   where: {
    //     id: chatWithoutAuthor.id,
    //   },
    //   data: {
    //     authorId: chatWithoutAuthor.post.userId,
    //   },
    // })
  })
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
