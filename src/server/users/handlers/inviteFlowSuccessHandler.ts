import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import createHttpError from 'http-errors'
import { withMiddleware } from '../../middlewares/withMiddleware'
import Joi from 'joi'
import { getServerSession } from 'next-auth'
import { joiPayloadValidateMiddleware } from '@/server/middlewares/custom/joiPayloadValidateMiddleware'
import { authOptions } from '@/server/auth/nextauth'
import { invitesFindByTokenService } from '@/server/invites/services/invitesFindByToken.service'
import { prisma } from '@/server/db'
import { invitesMarkAsCompleted } from '@/server/invites/services/invitesMarkAsCompleted.service'

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

  const token = req.query.token as string
  const session = await getServerSession(req, res, authOptions)
  const sessionUserEmail = session?.user?.email

  const invite = await invitesFindByTokenService(prisma, token)
  if (invite && invite.email === sessionUserEmail && !invite.completedAt) {
    await invitesMarkAsCompleted(prisma, token)
  }

  res.redirect('/p')
}

// export
export default withMiddleware()(
  joiPayloadValidateMiddleware(
    { query: schema },
    inviteFlowSuccessHandler,
  ) as NextApiHandler,
)
