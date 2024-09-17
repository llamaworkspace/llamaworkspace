import { env } from '@/env.mjs'
import { readFileSafeAsUint8Array } from '@/lib/backend/nodeUtils'
import { getS3Client } from '@/lib/backend/s3Utils'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { LlamaParseReader } from 'llamaindex'
import { downloadAssetFromS3Service } from '../services/downloadAssetFromS3.service'

const { s3Client, s3BucketName } = getS3Client()

export class PreprocessingHandler {
  constructor(
    private readonly prisma: PrismaClientOrTrxClient,
    private readonly context: UserOnWorkspaceContext,
  ) {}

  async run(assetId: string) {
    // Download the file.
    const asset = await this.pullAssetFromRemote(assetId)

    // Send it to llamaparse / llamaws-cloud.
    const markdown = await this.doProcessing(asset.filePath)

    await this.savePreprocessedVersion(assetId, markdown)
  }

  private async pullAssetFromRemote(assetId: string) {
    return await downloadAssetFromS3Service(this.prisma, this.context, {
      assetId,
    })
  }

  private async doProcessing(filePath: string) {
    const apiKey = env.LLAMACLOUD_API_KEY
    const reader = new LlamaParseReader({
      apiKey,
      resultType: 'text',
      verbose: true,
      fastMode: true,
    })

    const buffer = await readFileSafeAsUint8Array(filePath)

    // This loadDataAsContent waits until the result is returned
    const documents = await reader.loadDataAsContent(buffer)
    return documents
      .map((doc, index) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return `# Page ${index + 1}\n\n${doc.text}`
      })
      .join('\n\n')
  }

  private async savePreprocessedVersion(assetId: string, contents: string) {
    return this.prisma.asset.update({
      where: {
        id: assetId,
      },
      data: {
        contentsAsMarkdown: contents,
      },
    })
  }
}
