// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// To run, go to the server and invoke:
// npx env-cmd npx tsx src/scripts/<path_to_file_including_ts_extension>

import { prisma } from '@/server/db'
import Bluebird from 'bluebird'

async function main() {
  const postConfigCollection = await prisma.postConfigVersion.findMany({
    select: {
      id: true,
      model: true,
    },
  })

  console.log(`Updating ${postConfigCollection.length} post config items...`)

  await Bluebird.mapSeries(postConfigCollection, async ({ id, model }) => {
    if (model.includes('/')) {
      return
    }
    await prisma.postConfigVersion.update({
      where: {
        id,
      },
      data: {
        model: `openai/${model}`,
      },
    })
  })
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
