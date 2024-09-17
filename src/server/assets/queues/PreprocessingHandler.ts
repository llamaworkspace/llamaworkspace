import { env } from '@/env.mjs'
import { readFileSafeAsUint8Array } from '@/lib/backend/nodeUtils'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { Asset } from '@prisma/client'
import ky from 'ky'
import mime from 'mime'
import { downloadAssetFromS3Service } from '../services/downloadAssetFromS3.service'

export class PreprocessingHandler {
  constructor(
    private readonly prisma: PrismaClientOrTrxClient,
    private readonly context: UserOnWorkspaceContext,
  ) {}

  async run(assetId: string) {
    const asset = await this.prisma.asset.findUniqueOrThrow({
      where: {
        id: assetId,
      },
    })

    const { filePath, deleteFile } = await this.pullAssetFromRemote(assetId)

    try {
      const markdown = await this.doProcessing(asset, filePath)

      await this.savePreprocessedVersion(assetId, markdown)
    } catch (error) {
      throw error
    } finally {
      await deleteFile()
    }
  }

  private async pullAssetFromRemote(assetId: string) {
    return await downloadAssetFromS3Service(this.prisma, this.context, {
      assetId,
    })
  }

  private async doProcessing(asset: Asset, filePath: string) {
    const apiKey = env.LLAMACLOUD_API_KEY
    const buffer = await readFileSafeAsUint8Array(filePath)

    const formData = new FormData()

    // // Full body commands here:
    // // https://github.com/run-llama/LlamaIndexTS/blob/main/packages/cloud/src/reader.ts#L244

    const type = mime.getType(asset.path)

    if (!type) {
      throw new Error('Unknown file type')
    }

    formData.append('file', new Blob([buffer], { type }), asset.originalName)
    formData.append('page_separator', '---PAGE_SEPARATOR---\n')

    const response = await ky.post(
      'https://api.cloud.llamaindex.ai/api/parsing/upload',
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      },
    )

    const { id: jobId } = await response.json<{ id: string; status: string }>()

    let tries = 0
    const MAX_TRIES = 3600
    while (true) {
      tries++
      if (tries > MAX_TRIES) {
        throw new Error('Timeout while waiting for output')
      }
      await sleep(1000)
      const result = await this.getProcessingStatus(jobId)

      if (result.status === 'SUCCESS') {
        const { markdown } = await this.getProcessingResult(jobId)

        return markdown
          .split('---PAGE_SEPARATOR---\n')
          .map((text, index) => {
            return `# Page ${index + 1}\n\n${text}`
          })
          .join('\n\n')
      }
    }
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

  private async getProcessingStatus(jobId: string) {
    const apiKey = env.LLAMACLOUD_API_KEY
    const response = await ky.get(
      `https://api.cloud.llamaindex.ai/api/parsing/job/${jobId}`,
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      },
    )
    return await response.json<{ id: string; status: string }>()
  }
  private async getProcessingResult(jobId: string) {
    const apiKey = env.LLAMACLOUD_API_KEY
    const response = await ky.get(
      `https://api.cloud.llamaindex.ai/api/parsing/job/${jobId}/result/markdown`,
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      },
    )
    return await response.json<{ markdown: string }>()
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
