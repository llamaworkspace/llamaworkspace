import type { WorkflowRegistryEntry } from '@/hatchet/lib/workflow-types'
import { AppEngineRunner } from '@/server/ai/lib/AppEngineRunner/AppEngineRunner'
import { appEnginesRegistry } from '@/server/ai/lib/engines/appEnginesRegistry'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import type { Context, Workflow } from '@hatchet-dev/typescript-sdk'
import { z } from 'zod'

const zBindAssetToAppWorkflowPayload = z.object({
  userId: z.string(),
  assetOnAppId: z.string(),
})

export type BindAssetToAppWorkflowPayload = z.infer<
  typeof zBindAssetToAppWorkflowPayload
>

const handler = async (ctx: Context<BindAssetToAppWorkflowPayload>) => {
  const payload = ctx.workflowInput()
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
  await appEngineRunner.onAssetAdded(assetOnAppId)
}

export const workflow: Workflow = {
  id: 'bind-asset-to-app',
  description: 'Binds an asset to an app',
  steps: [
    {
      name: 'bind-asset-to-app',
      run: handler,
    },
  ],
}

export const bindAssetToAppWorkflow = {
  workflow,
  payload: zBindAssetToAppWorkflowPayload,
} satisfies WorkflowRegistryEntry
