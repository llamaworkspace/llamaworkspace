// This method call has been isolated on a separate file
// to simplify mocking
import { prisma } from 'server/db'
import { PermissionAction } from 'shared/permissions/permissionDefinitions'
import * as PermissionsVerifierWrapper from '../PermissionsVerifier'

const { PermissionsVerifier } = PermissionsVerifierWrapper

type MockedPermissionsVerifier = {
  passOrThrowTrpcError: InstanceType<
    typeof PermissionsVerifier
  >['passOrThrowTrpcError']
  call: jest.Mock
}

jest.mock('../PermissionsVerifier', () => {
  const originalModule = jest.requireActual(
    '../PermissionsVerifier',
  ) as unknown as typeof PermissionsVerifierWrapper

  return {
    PermissionsVerifier: jest.fn().mockImplementation(() => ({
      passOrThrowTrpcError:
        // eslint-disable-next-line @typescript-eslint/unbound-method
        originalModule.PermissionsVerifier.prototype.passOrThrowTrpcError,
      call: jest.fn(),
    })),
  }
})

describe('PermissionsVerifier.passOrThrowTrpcError', () => {
  let permissionsVerifier: MockedPermissionsVerifier

  beforeEach(() => {
    permissionsVerifier = new PermissionsVerifier(
      prisma,
    ) as unknown as MockedPermissionsVerifier
  })

  describe('when call returns true', () => {
    beforeEach(() => {
      permissionsVerifier.call.mockResolvedValue(true)
    })
    it('returns true', async () => {
      const result = await permissionsVerifier.passOrThrowTrpcError(
        PermissionAction.Update,
        'userId',
        'postId',
      )

      expect(permissionsVerifier.call).toHaveBeenCalled()
      expect(result).toBe(true)
    })
  })

  describe('when call returns false', () => {
    beforeEach(() => {
      permissionsVerifier.call.mockResolvedValue(false)
    })
    it('returns false', async () => {
      await expect(
        permissionsVerifier.passOrThrowTrpcError(
          PermissionAction.Update,
          'userId',
          'postId',
        ),
      ).rejects.toThrow(
        'You do not have enough permissions to perform this action',
      )
    })
  })
})
