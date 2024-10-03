import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { protectedProcedure } from '@/server/trpc/trpc'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { Promise } from 'bluebird'
import { z } from 'zod'

const zInput = z.object({
  appIds: z.array(z.string()),
  action: z.nativeEnum(PermissionAction),
})

export const getCanPerformActionForAppIds = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    const { appIds, action } = input
    return await Promise.map(appIds, async (appId) => {
      return {
        id: appId,
        can: await new PermissionsVerifier(ctx.prisma).call(
          action,
          userId,
          appId,
        ),
      }
    })
  })
