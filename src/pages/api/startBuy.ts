// pages/api/startBuy.ts
import { WorkflowClient } from '@temporalio/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { OneClickBuy } from 'temporal/src/workflows'

export default async function startBuy(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { itemId } = req.body as unknown as { itemId: string } // TODO: validate itemId and req.method
  const client = new WorkflowClient()
  const handle = await client.start(OneClickBuy, {
    workflowId: 'business-meaningful-id',
    taskQueue: 'tutorial', // must match the taskQueue polled by Worker above
    args: [itemId],
    // workflowId: // TODO: use business-meaningful user/transaction ID here
  }) // kick off the purchase async

  res.status(200).json({ workflowId: handle.workflowId })
}
