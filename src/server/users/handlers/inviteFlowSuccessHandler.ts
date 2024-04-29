import { authOptions } from '@/server/auth/nextauth'
import { prisma } from '@/server/db'
import { joiPayloadValidateMiddleware } from '@/server/middlewares/custom/joiPayloadValidateMiddleware'
import createHttpError from 'http-errors'
import Joi from 'joi'
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { withMiddleware } from '../../middlewares/withMiddleware'
import { inviteSuccessOrchestrationService } from '../services/inviteSuccessOrchestration.service'

const schema = Joi.object({
  token: Joi.string(),
})

interface BodyPayload {
  userId: string
  amountInCents: number
}

interface NextApiRequestWithBody extends NextApiRequest {
  body: BodyPayload
}

const inviteFlowSuccessHandler = async (
  req: NextApiRequestWithBody,
  res: NextApiResponse,
) => {
  if (req.method !== 'GET') {
    throw createHttpError(404)
  }

  const inviteToken = req.query.token as string
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    throw createHttpError(401)
  }
  const sessionUserEmail = session.user.email
  const userId = session.user.id

  // inviteSuccessOrchestrationService
  await inviteSuccessOrchestrationService(prisma, userId, inviteToken)

  return res.status(200).send(`ok`)

  res.redirect('/p')
}

// export
export default withMiddleware()(
  joiPayloadValidateMiddleware(
    { query: schema },
    inviteFlowSuccessHandler,
  ) as NextApiHandler,
)
