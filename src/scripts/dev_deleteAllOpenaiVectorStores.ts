import { env } from '@/env.mjs'
import OpenAI from 'openai'

async function main() {
  if (env.NODE_ENV !== 'development') {
    console.error('This script can only be run in development mode')
    return
  }
  const openai = new OpenAI({ apiKey: env.INTERNAL_OPENAI_API_KEY })

  const vectorStores = await openai.beta.vectorStores.list()

  const length = vectorStores.data.length
  console.log(`Found ${length} vector stores.`)

  for (const [index, vectorStore] of vectorStores.data.entries()) {
    console.log(
      `${index + 1}/${length} Deleting vector store ${vectorStore.id}`,
    )
    await openai.beta.vectorStores.del(vectorStore.id)
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0))
