import type { Workflow } from '@hatchet-dev/typescript-sdk'
import { HatchetClient } from '@hatchet-dev/typescript-sdk/clients/hatchet-client'
import { scheduleDemoWorkflow } from './workflows/schedule-demo'

const token = process.env.HATCHET_CLIENT_TOKEN

const hatchet = HatchetClient.init({
  token,
})

const workflow: Workflow = {
  id: 'first-typescript-workflow',
  description: 'This is my first workflow',
  on: {
    event: 'user:create',
  },
  steps: [
    {
      name: 'step1',
      run: async (ctx) => {
        console.log(
          'starting step1 with the following input',
          ctx.workflowInput(),
        )

        return {
          result: 'success!',
        }
      },
    },
  ],
}

async function main() {
  console.log(1111)
  const worker = await hatchet.worker('main-worker')
  await worker.registerWorkflow(workflow)
  await worker.registerWorkflow(scheduleDemoWorkflow)

  const workflowRun = hatchet.admin.runWorkflow(
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

  console.log(22222, workflowRun)
}

void main()
