import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from 'server/db'
import { withMiddleware } from 'server/middlewares/withMiddleware'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    await prisma.user.findFirst()
    return res.status(200).send('ok')
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method Not Allowed`)
  }
}

export const statusCheckerHandler = withMiddleware()(handler)
