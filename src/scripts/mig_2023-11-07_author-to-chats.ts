// To run, go to the server and invoke: npx tsx <path_to_this_file>
// NOTE: "tsx" (not "tsc")  !!
import { prisma } from '@/server/db'
import Bluebird from 'bluebird'

async function main() {
  const chatsWithoutAuthor = await prisma.chat.findMany({
    select: {
      id: true,
      post: {
        select: {
          userId: true,
        },
      },
    },
    where: {
      authorId: null,
    },
  })

  console.log(`Updating ${chatsWithoutAuthor.length} chats...`)

  await Bluebird.mapSeries(chatsWithoutAuthor, async (chatWithoutAuthor) => {
    await prisma.chat.update({
      where: {
        id: chatWithoutAuthor.id,
      },
      data: {
        authorId: chatWithoutAuthor.post.userId,
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
