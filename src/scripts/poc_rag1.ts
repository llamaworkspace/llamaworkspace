import { env } from '@/env.mjs'
import { createOpenAI } from '@ai-sdk/openai'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { generateText } from 'ai'
import path from 'path'

const openRouterClientPayload = {
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.INTERNAL_OPENROUTER_API_KEY,
}

const openrouter = createOpenAI(openRouterClientPayload)

const openaiClientPayload = {
  apiKey: env.INTERNAL_OPENAI_API_KEY,
}

const oai = createOpenAI(openaiClientPayload)

async function main() {
  const extracted = await loadAndParseFile()
  console.log('---------')
  return await cleanTextWithGpt4Mini(extracted[0]!.pageContent)
}

async function loadAndParseFile() {
  const resolved = path.resolve(__dirname, 'cv.pdf')
  const loader = new PDFLoader(resolved, { splitPages: false })
  return await loader.load()
}

async function cleanTextWithGpt4Mini(inputText: string) {
  const { text } = await generateText({
    model: oai('gpt-4o-mini'),
    maxTokens: 10,
    messages: [
      {
        role: 'system',
        content:
          'You will receive the result of a parsed PDF file. Return a cleaned version in markdown format. Do not provide any other wrapping text around the result. Just the cleaned text.',
      },
      {
        role: 'user',
        content: inputText,
      },
    ],
  })

  return text
}
async function cleanTextWithLlama(inputText: string) {
  const { text, ...rest } = await generateText({
    model: openrouter('meta-llama/llama-3.1-405b-instruct'),
    maxTokens: 10,
    messages: [
      {
        role: 'system',
        content:
          'You will receive the result of a parsed PDF file. Return a cleaned version in markdown format. Do not provide any other wrapping text around the result. Just the cleaned text.',
      },
      {
        role: 'user',
        content: inputText,
      },
    ],
  })
  console.log('Cleaned', rest)
  console.log('Text clean', text)
  return text
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit(0))
