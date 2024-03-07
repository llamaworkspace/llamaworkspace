// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// To run, go to the server and invoke:
// npx env-cmd npx tsx src/scripts/mig_2023-12-25_openai_key_to_ai_provider.ts

import { upsertAiProviderService } from '@/server/ai/services/upsertProviderKVs.service'
import { prisma } from '@/server/db'
import Bluebird from 'bluebird'

async function main() {
  const workspacesWithOpenAiKey = await prisma.workspace.findMany({
    select: {
      id: true,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      openAiApiKey: true,
    },
    where: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      openAiApiKey: {
        not: null,
      },
    },
  })

  console.log(`Updating ${workspacesWithOpenAiKey.length} workspaces...`)

  await Bluebird.mapSeries(workspacesWithOpenAiKey, async (workspace) => {
    await upsertAiProviderService(prisma, workspace.id, 'openai', {
      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      apiKey: workspace.openAiApiKey!,
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    })
  })
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
