// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// To run, go to the server and invoke:
// npx env-cmd npx tsx src/scripts/<path_to_file_including_ts_extension>

import { upsertAiProviderService } from '@/server/ai/services/upsertProviderKVs.service'
import { prisma } from '@/server/db'
import Bluebird from 'bluebird'

async function main() {
  const workspaces = await prisma.workspace.findMany()

  console.log(`Updating ${workspaces.length} workspaces...`)

  await Bluebird.mapSeries(workspaces, async (workspace) => {
    await upsertAiProviderService(prisma, workspace.id, 'openai', undefined, [
      {
        slug: 'gpt-4-1106-preview',
        enabled: true,
      },
      {
        slug: 'gpt-3.5-turbo',
        enabled: true,
      },
    ])
  })
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
