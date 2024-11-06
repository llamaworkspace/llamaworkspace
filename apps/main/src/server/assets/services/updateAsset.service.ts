import type { AssetUploadStatus } from '@/components/assets/assetTypes'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { scopeAssetByWorkspace } from '../assetUtils'

interface UpdateAssetPayload {
  assetId: string
  uploadStatus?: AssetUploadStatus
}

export const updateAssetService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: UpdateAssetPayload,
) => {
  const { workspaceId } = uowContext
  const { assetId, ...rest } = payload

  return await prismaAsTrx(prisma, async (prisma) => {
    await prisma.asset.findFirstOrThrow({
      where: scopeAssetByWorkspace({ id: assetId }, workspaceId),
    })

    return await prisma.asset.update({
      where: {
        id: assetId,
      },
      data: rest,
    })
  })
}
