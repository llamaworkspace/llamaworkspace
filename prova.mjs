import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import fs from 'fs'
import OpenAI from 'openai'
import path from 'path'
import internal from 'stream'

const INTERNAL_OPENAI_API_KEY = ''

const S3_BUCKET_NAME = 'llamaws-test'
const S3_REGION = 'us-east-1'
const S3_ACCESS_KEY_ID = ''
const S3_SECRET_ACCESS_KEY = ''

const vectorStoreId = 'vs_CI3ISs9z5nmoaYWJw2PTe5KB'

const credentials = {
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
}
const s3Client = new S3Client({ region: S3_REGION, credentials })

const openai = new OpenAI({ apiKey: INTERNAL_OPENAI_API_KEY })

async function main() {
  const fileStream = fs.createReadStream('2024-07_llamaws_preseed_deck.pdf')
  const res = await openai.beta.vectorStores.fileBatches.uploadAndPoll(
    vectorStoreId,
    {
      files: [fileStream],
    },
  )
  console.log(res)
}

async function main2() {
  console.log('Main2 start')
  const key =
    'workspaces/cly18jbkn0002a7g83np4fz2v/cly7cpbui004xr3y1hffc74lw.pdf'
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
  })

  const response = await s3Client.send(command)
  if (!response.Body || !(response.Body instanceof internal.Readable)) {
    throw new Error('Response body is not a readable stream')
  }

  // Let's save this file locally
  const readable = response.Body
  if (!readable) {
    throw new Error('Response body is not a readable stream')
  }

  const filePath = path.join(
    process.cwd(),
    '/tmp/cly7cpbui004xr3y1hffc74lw.pdf',
  )
  console.log(111, filePath)
  const ostream = fs.createWriteStream(filePath)

  return new Promise((resolve, reject) => {
    readable.pipe(ostream)

    ostream.on('finish', () => {
      console.log('File download complete')
      resolve(filePath)
    })

    ostream.on('error', (err) => {
      console.error('Error writing file', err)
      reject(err)
    })

    readable.on('error', (err) => {
      console.error('Error reading stream', err)
      reject(err)
    })
  })
  // if (readable instanceof internal.Readable) {
  //   readable.pipe(ostream)
  // }
}

main2()
  .then((res) => console.log('Done!', res))
  .catch(console.error)
  .finally(() => process.exit(0))
