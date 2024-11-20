import type { z } from 'zod'
import { getHatchetClient } from './lib/hatchet-client'

import type {
  WorkflowNames,
  hatchetWorkflowsRegistry,
} from './hatchet-workflows-registry'

export const enqueueJob = async <T extends WorkflowNames>(
  name: T,
  payload: z.infer<(typeof hatchetWorkflowsRegistry)[T]['payload']>,
) => {
  const hatchetClient = getHatchetClient()

  // Keeping it async to allow for future async operations
  await Promise.resolve(
    hatchetClient.admin.runWorkflow(name, payload, {
      additionalMetadata: {},
    }),
  )
}
