// To run, go to the server and invoke:
// npx env-cmd npx tsx src/scripts/mig_2023-12-25_openai_key_to_ai_provider.ts

import { upsertAiProvider } from '@/server/ai/services/upsertProviderKVs.service'
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
    await upsertAiProvider(prisma, workspace.id, 'openai', undefined, {
      apiKey: workspace.openAiApiKey!,
    })
  })
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
