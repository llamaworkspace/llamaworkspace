import type { Workflow } from '@hatchet-dev/typescript-sdk'

export const sampleWorkflow: Workflow = {
  id: 'first-typescript-workflow',
  description: 'This is my first workflow',
  on: {
    event: 'user:create',
  },
  steps: [
    {
      name: 'step1',
      run: async (ctx) => {
        await new Promise((resolve) => setTimeout(resolve, 100))
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
