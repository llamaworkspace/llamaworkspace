import { AppEngineRunner } from '@/server/ai/lib/AppEngineRunner/AppEngineRunner'
import { appEnginesRegistry } from '@/server/ai/lib/engines/appEnginesRegistry'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { z } from 'zod'

import type { WorkflowRegistryEntry } from '@/hatchet/lib/workflow-types'
import type { Context, Workflow } from '@hatchet-dev/typescript-sdk'

const zUnbindAssetFromAppWorkflowPayload = z.object({
  userId: z.string(),
  assetOnAppId: z.string(),
})

export type UnbindAssetFromAppWorkflowPayload = z.infer<
  typeof zUnbindAssetFromAppWorkflowPayload
>

const handler = async (ctx: Context<UnbindAssetFromAppWorkflowPayload>) => {
  const payload = ctx.workflowInput()
  return prismaAsTrx(prisma, async (prismaAsTrx) => {
    const assetOnAppId = payload.assetOnAppId

    const assetOnApp = await prisma.assetsOnApps.findFirstOrThrow({
      where: {
        id: assetOnAppId,
      },
      include: {
        app: true,
      },
    })

    const app = await prisma.app.findFirstOrThrow({
      where: {
        id: assetOnApp.appId,
        markAsDeletedAt: null,
      },
    })

    const context = await createUserOnWorkspaceContext(
      prisma,
      app.workspaceId,
      payload.userId,
    )

    const appEngineRunner = new AppEngineRunner(
      prisma,
      context,
      appEnginesRegistry,
    )

    await appEngineRunner.onAssetRemoved(assetOnApp.id)
    await prismaAsTrx.assetsOnApps.deleteMany({
      where: {
        appId: assetOnApp.appId,
        assetId: assetOnApp.assetId,
      },
    })
  })
}

export const workflow: Workflow = {
  id: 'unbind-asset-from-app',
  description: 'Unbinds an asset from an app',
  steps: [
    {
      name: 'unbind-asset-from-app',
      run: handler,
    },
  ],
}

export const unbindAssetFromAppWorkflow = {
  workflow: workflow,
  payload: zUnbindAssetFromAppWorkflowPayload,
} satisfies WorkflowRegistryEntry
