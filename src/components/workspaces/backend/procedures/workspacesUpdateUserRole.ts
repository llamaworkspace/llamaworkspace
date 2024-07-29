import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { protectedProcedure } from '@/server/trpc/trpc'
import { updateUserRoleForWorkspaceService } from '@/server/workspaces/services/updateUserRoleForWorkspace.service'
import { UserRole } from '@/shared/globalTypes'
import { z } from 'zod'
import { workspaceEditionFilter } from '../workspacesBackendUtils'

const zInput = z.object({
  workspaceId: z.string(),
  role: z.nativeEnum(UserRole),
})

export const workspacesUpdateUserRole = protectedProcedure
  .input(zInput)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    const { workspaceId, ...payload } = input

    await ctx.prisma.workspace.findFirstOrThrow({
      where: {
        id: workspaceId,
        ...workspaceEditionFilter(userId),
      },
    })

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      workspaceId,
      userId,
    )

    return await updateUserRoleForWorkspaceService(ctx.prisma, context, {
      role: payload.role,
    })
  })
