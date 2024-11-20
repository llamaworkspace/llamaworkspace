import type { WorkflowRegistryEntry } from '@/hatchet/lib/workflow-types'
import { AppEngineRunner } from '@/server/ai/lib/AppEngineRunner/AppEngineRunner'
import { appEnginesRegistry } from '@/server/ai/lib/engines/appEnginesRegistry'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prisma } from '@/server/db'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type { Context, Workflow } from '@hatchet-dev/typescript-sdk'
import { z } from 'zod'

export const zDeleteAppWorkflowPayload = z.object({
  appId: z.string(),
  userId: z.string(),
})

export type DeleteAppWorkflowPayload = z.infer<typeof zDeleteAppWorkflowPayload>

const step1 = async (ctx: Context<DeleteAppWorkflowPayload>) => {
  return prismaAsTrx(prisma, async (prismaAsTrx) => {
    const payload = ctx.workflowInput()
    const app = await prismaAsTrx.app.findFirstOrThrow({
      where: {
        id: payload.appId,
      },
      include: {
        assetsOnApps: true,
      },
    })

    const context = await createUserOnWorkspaceContext(
      prismaAsTrx,
      app.workspaceId,
      payload.userId,
    )

    const appEngineRunner = new AppEngineRunner(
      prisma,
      context,
      appEnginesRegistry,
    )

    for (const assetOnApp of app.assetsOnApps) {
      await appEngineRunner.onAssetRemoved(assetOnApp.id)
    }

    await appEngineRunner.onAppDeleted(payload.appId)

    // Important: App deletion must happen last.
    await prismaAsTrx.app.delete({
      where: {
        id: payload.appId,
      },
    })
  })
}

export const handler: Workflow = {
  id: 'delete-app',
  description: 'Deletes an app',
  steps: [
    {
      name: 'delete-app',
      run: step1,
    },
  ],
}

export const deleteAppWorkflow = {
  workflow: handler,
  payload: zDeleteAppWorkflowPayload,
} satisfies WorkflowRegistryEntry
