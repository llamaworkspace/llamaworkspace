import { env } from '@/env.mjs'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import fs from 'fs'
import { LlamaParseReader } from 'llamaindex'
import { downloadAssetFromS3Service } from '../services/downloadAssetFromS3.service'

export class PreprocessingHandler {
  constructor(
    private readonly prisma: PrismaClientOrTrxClient,
    private readonly context: UserOnWorkspaceContext,
  ) {}

  async run(assetId: string) {
    // Download the file.
    // const asset = await this.pullAssetFromRemote(assetId)

    // Send it to llamaparse.
    const docs = await this.sendItToLlamaParse()
    console.log(1, docs)

    // // Poll.
    // this.pollThingWhichRequiresAnId()

    // // When we have the markdown, we store another version of the file marked as "processed".
    // this.saveAsMarkdown()

    // // Links to the original will be lost!
    // this.replaceAssetWithAPreprocessedVersion()

    //
  }

  private async pullAssetFromRemote(assetId: string) {
    return await downloadAssetFromS3Service(this.prisma, this.context, {
      assetId,
    })
  }

  private async sendItToLlamaParse() {
    const apiKey = env.LLAMACLOUD_API_KEY
    const reader = new LlamaParseReader({
      apiKey,
      resultType: 'text',
      verbose: true,
      language: 'en',
      fastMode: true,
    })

    const buffer = fs.readFileSync('./thing/sample.pdf')

    // This loadDataAsContent waits until the result is returnd
    const documents = await reader.loadDataAsContent(new Uint8Array(buffer))
    return documents
  }
}

// 1 [
//   Document {
//     id_: 'aed0bb7e-9f1e-4fc6-9630-c5dd93224454',
//     metadata: {},
//     excludedEmbedMetadataKeys: [],
//     excludedLlmMetadataKeys: [],
//     relationships: {},
//     embedding: undefined,
//     text: 'This is an example\n' +
//       'There are 1,000 people working in my company, which is named Lorem Jarl.',
//     textTemplate: '',
//     metadataSeparator: '\n'
//   }
// ]
