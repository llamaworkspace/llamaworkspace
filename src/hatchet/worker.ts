import { Workflow } from '@hatchet-dev/typescript-sdk'
import { HatchetClient } from '@hatchet-dev/typescript-sdk/clients/hatchet-client'

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
  const worker = await hatchet.worker('first-typescript-workflow')
  await worker.registerWorkflow(workflow)
  await worker.start()

  const workflowRun = await hatchet.admin.runWorkflow(
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
  console.log(workflowRun)
}

main()
