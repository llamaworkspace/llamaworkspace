import { deleteAppWorkflow } from '@/server/apps/workflows/delete-app-workflow'
import { bindAssetToAppWorkflow } from '@/server/assets/workflows/bind-asset-to-app-workflow'
import { unbindAssetFromAppWorkflow } from '@/server/assets/workflows/unbind-asset-from-app-workflow'
import { sendEmailWorkflow } from '@/server/messaging/workflows/send-email-workflow'
import type { WorkflowRegistry } from './lib/workflow-types'

export const hatchetWorkflowsRegistry = {
  'send-email': sendEmailWorkflow,
  'delete-app': deleteAppWorkflow,
  'bind-asset-to-app': bindAssetToAppWorkflow,
  'unbind-asset-from-app': unbindAssetFromAppWorkflow,
} satisfies WorkflowRegistry

export type WorkflowNames = keyof typeof hatchetWorkflowsRegistry
