import { hatchetWorkflowsRegistry } from './hatchet-workflows-registry'
import { getHatchetClient } from './lib/hatchet-client'
import type { WorkflowRegistry } from './lib/workflow-types'

async function main(workflowRegistry: WorkflowRegistry) {
  const mainWorker = await getHatchetClient().worker('main-worker')

  await Promise.all(
    Object.values(workflowRegistry).map((workflow) =>
      mainWorker.registerWorkflow(workflow.workflow),
    ),
  )

  await mainWorker.start()
}

void main(hatchetWorkflowsRegistry)
