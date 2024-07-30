import { getEnumByValue } from '@/lib/utils'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { protectedProcedure } from '@/server/trpc/trpc'
import { getUserService } from '@/server/users/services/getUser.service'
import { getUserWorkspacesService } from '@/server/users/services/getUserWorkspaces.service'
import { getUserOnWorkspaceForUserService } from '@/server/workspaces/services/getUserOnWorkspaceForUser.service'
import { UserRole } from '@/shared/globalTypes'
import { TRPCError } from '@trpc/server'
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
      await getUserWorkspacesService(ctx.prisma, userId),
    ])

    if (!workspaces.length) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'At least one workspace is required for a user',
      })
    }

    const firstWorkspace = workspaces[0]!
    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      firstWorkspace.id,
      userId,
    )
    const userOnWorkspace = await getUserOnWorkspaceForUserService(
      ctx.prisma,
      context,
      { userId },
    )

    return {
      ...user,
      defaultModel: user.defaultModel!,
      workspace: {
        id: firstWorkspace.id,
        name: firstWorkspace.name,
        onboardingCompletedAt: firstWorkspace.onboardingCompletedAt,
        role: getEnumByValue(UserRole, userOnWorkspace.role),
      },
    }
  })
