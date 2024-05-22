import { Worker } from '@temporalio/worker'
import * as activities from './activities'

run().catch((err) => console.log(err))

async function run() {
  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'), // passed to Webpack for bundling
    activities, // directly imported in Node.js
    taskQueue: 'tutorial',
  })
  await worker.run()
}
