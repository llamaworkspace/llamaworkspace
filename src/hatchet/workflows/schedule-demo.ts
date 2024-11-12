import type { Workflow } from '@hatchet-dev/typescript-sdk'

export const scheduleDemoWorkflow: Workflow = {
  id: 'scheduled-workflow',
  description: 'A workflow triggered by a schedule',
  on: {
    cron: '* * * * *', // Run every minute
  },
  steps: [
    {
      name: 'step1',
      run: (ctx) => {
        console.log('executed step1!')
        ctx.logger.info('executed step1!')
        return { step1: 'step1' }
      },
    },
    {
      name: 'step2',
      parents: ['step1'],
      run: (ctx) => {
        console.log('executed step2!')
        ctx.logger.info('executed step2!')
        return { step2: 'step2' }
      },
    },
  ],
}
