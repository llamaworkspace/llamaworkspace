import { env } from '@/env.mjs'
import { HatchetClient } from '@hatchet-dev/typescript-sdk/clients/hatchet-client'
import { sampleWorkflow } from './workflows/sample-workflow'
import { scheduleDemoWorkflow } from './workflows/schedule-demo'

const hatchet = HatchetClient.init({
  token: env.HATCHET_CLIENT_TOKEN,
})

async function main() {
  const worker = await hatchet.worker('main-worker')
  await worker.registerWorkflow(sampleWorkflow)
  await worker.registerWorkflow(scheduleDemoWorkflow)

  // Enqueue a random workflow run on startup
  hatchet.admin.runWorkflow(
    'first-typescript-workflow',
    {
      test: 'test',
    },
    {
      additionalMetadata: {
        hello: 'moon',
      },
    },
  )

  await worker.start()
}

void main()
