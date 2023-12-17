import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/nextauth'

export const nextApiSessionChecker = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const session = await getServerSession(req, res, authOptions)
  return !!session
}
