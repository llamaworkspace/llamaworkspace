import type { Workflow } from '@hatchet-dev/typescript-sdk'
import type { z } from 'zod'

export type WorkflowRegistryEntry = {
  workflow: Workflow
  payload: z.ZodType<unknown>
}

export type WorkflowRegistry = Record<string, WorkflowRegistryEntry>
