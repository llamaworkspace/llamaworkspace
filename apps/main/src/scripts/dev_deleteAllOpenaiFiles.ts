// npx tsx ./src/scripts/dev_deleteAllOpenaiFiles.ts
import { env } from '@/env.mjs'
import OpenAI from 'openai'

const INTERNAL_OPENAI_API_KEY = process.env.INTERNAL_OPENAI_API_KEY

async function main() {
  if (env.NODE_ENV !== 'development') {
    console.error('This script can only be run in development mode')
    return
  }
  const openai = new OpenAI({ apiKey: INTERNAL_OPENAI_API_KEY })

  const files = await openai.files.list()

  const length = files.data.length
  console.log(`Found ${length} files.`)

  for (const [index, file] of files.data.entries()) {
    console.log(`${index + 1}/${length} Deleting file ${file.id}`)
    await openai.files.del(file.id)
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0))
