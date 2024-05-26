import { TRPCError } from '@trpc/server'
import { protectedProcedure } from 'server/trpc/trpc'
import { getUserService } from 'server/users/services/getUser.service'
import { getUserWorkspaces } from 'server/users/services/getUserWorkspaces.service'
import { zodUserOutput } from '../usersBackendUtils'

export const userGetSelf = protectedProcedure
  .output(zodUserOutput)
  .query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const select = {
      id: true,
      email: true,
      name: true,
      defaultModel: true,
    }

    const [user, workspaces] = await Promise.all([
      await getUserService(ctx.prisma, userId, { select }),
      await getUserWorkspaces(ctx.prisma, userId, {
        select: { id: true, name: true },
      }),
    ])

    if (!workspaces.length) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'At least one workspace is required for a user',
      })
    }

    return {
      ...user,
      defaultModel: user.defaultModel!,
      workspace: {
        id: workspaces[0]!.id,
        name: workspaces[0]!.name,
      },
    }
  })
