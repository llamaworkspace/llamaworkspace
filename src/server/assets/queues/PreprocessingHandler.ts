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
    const docs = this.sendItToLlamaParse()
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
      resultType: 'markdown',
      verbose: true,
      language: 'en',
      fastMode: true,
    })

    const buffer = fs.readFileSync('./sample.pdf')
    const documents = await reader.loadDataAsContent(new Uint8Array(buffer))
    return documents
  }
}
