// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// To run, go to the server and invoke:
// npx env-cmd npx tsx src/scripts/<path_to_file_including_ts_extension>

import { prisma } from '@/server/db'
import Bluebird from 'bluebird'

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      defaultModel: true,
    },
  })

  console.log(`Updating ${users.length} users...`)

  await Bluebird.mapSeries(users, async ({ id, defaultModel }) => {
    if (!defaultModel) {
      return
    }
    if (defaultModel.includes('/')) {
      return
    }
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        defaultModel: `openai/${defaultModel}`,
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
