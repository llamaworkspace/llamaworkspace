'use strict'
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i]
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
        }
        return t
      }
    return __assign.apply(this, arguments)
  }
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1]
          return t[1]
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this
        }),
      g
    )
    function verb(n) {
      return function (v) {
        return step([n, v])
      }
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.')
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                    ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t
          if (((y = 0), t)) op = [op[0] & 2, t.value]
          switch (op[0]) {
            case 0:
            case 1:
              t = op
              break
            case 4:
              _.label++
              return { value: op[1], done: false }
            case 5:
              _.label++
              y = op[1]
              op = [0]
              continue
            case 7:
              op = _.ops.pop()
              _.trys.pop()
              continue
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0
                continue
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1]
                break
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1]
                t = op
                break
              }
              if (t && _.label < t[2]) {
                _.label = t[2]
                _.ops.push(op)
                break
              }
              if (t[2]) _.ops.pop()
              _.trys.pop()
              continue
          }
          op = body.call(thisArg, _)
        } catch (e) {
          op = [6, e]
          y = 0
        } finally {
          f = t = 0
        }
      if (op[0] & 5) throw op[1]
      return { value: op[0] ? op[1] : void 0, done: true }
    }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var UserFactory_1 = require('@/server/testing/factories/UserFactory')
var UsersOnWorkspacesFactory_1 = require('@/server/testing/factories/UsersOnWorkspacesFactory')
var WorkspaceFactory_1 = require('@/server/testing/factories/WorkspaceFactory')
var mockDb_1 = require('@/server/testing/mockDb')
var globalTypesWrapper = require('@/shared/globalTypes')
var server_1 = require('@trpc/server')
var userOnWorkspaceContext_1 = require('../userOnWorkspaceContext')
var mockFindFirst = jest.fn()
jest.mock('@/shared/globalTypes', function () {
  var original = jest.requireActual('@/shared/globalTypes')
  return __assign(__assign({}, original), {
    PrismaClientOrTrxClient: jest.fn().mockImplementation(function () {
      return {
        usersOnWorkspaces: {
          findFirst: mockFindFirst,
        },
      }
    }),
  })
})
var subject = function (workspaceId, userId) {
  return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [
            4 /*yield*/,
            (0, userOnWorkspaceContext_1.createUserOnWorkspaceContext)(
              mockDb_1.default,
              workspaceId,
              userId,
            ),
          ]
        case 1:
          return [2 /*return*/, _a.sent()]
      }
    })
  })
}
describe('createUserOnWorkspaceContext function', function () {
  var workspace, user, userOnWorkspace
  beforeEach(function () {
    mockDb_1.default.usersOnWorkspaces.findFirst.mockClear()
    workspace = WorkspaceFactory_1.WorkspaceFactory.build()
    user = UserFactory_1.UserFactory.build({ workspaceId: workspace.id })
    userOnWorkspace = UsersOnWorkspacesFactory_1.UsersOnWorkspacesFactory.build(
      {
        userId: user.id,
        workspaceId: workspace.id,
      },
    )
  })
  it('should return a UserOnWorkspaceContext instance when user has access', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var result
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            mockDb_1.default.usersOnWorkspaces.findFirst.mockResolvedValueOnce(
              userOnWorkspace,
            )
            return [4 /*yield*/, subject(workspace.id, user.id)]
          case 1:
            result = _a.sent()
            expect(result._type).toEqual('UserOnWorkspaceContext')
            expect(result.workspaceId).toEqual(workspace.id)
            expect(result.userId).toEqual(user.id)
            return [2 /*return*/]
        }
      })
    })
  })
  describe('when user lacks access', function () {
    it('should throw a TRPCError with code "UNAUTHORIZED"', function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var promise
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockDb_1.default.usersOnWorkspaces.findFirst.mockResolvedValueOnce(
                null,
              )
              promise = subject(workspace.id, user.id)
              return [
                4 /*yield*/,
                expect(promise).rejects.toThrow(server_1.TRPCError),
              ]
            case 1:
              _a.sent()
              return [
                4 /*yield*/,
                expect(promise).rejects.toHaveProperty('code', 'UNAUTHORIZED'),
              ]
            case 2:
              _a.sent()
              return [
                4 /*yield*/,
                expect(promise).rejects.toEqual(
                  expect.objectContaining({
                    message:
                      'You do not have the permissions to perform this action',
                  }),
                ),
              ]
            case 3:
              _a.sent()
              return [2 /*return*/]
          }
        })
      })
    })
  })
})
describe('UserOnWorkspaceContext class', function () {
  var workspaceId = 'workspace-class-test-id'
  var userId = 'user-class-test-id'
  it('create method should return an instance of UserOnWorkspaceContext', function () {
    var context = userOnWorkspaceContext_1.UserOnWorkspaceContext.create(
      mockDb_1.default,
      workspaceId,
      userId,
    )
    expect(context).toBeInstanceOf(
      userOnWorkspaceContext_1.UserOnWorkspaceContext,
    )
    expect(context.workspaceId).toBe(workspaceId)
    expect(context.userId).toBe(userId)
  })
  it('isContext method should validate instances correctly', function () {
    var context = userOnWorkspaceContext_1.UserOnWorkspaceContext.create(
      mockDb_1.default,
      workspaceId,
      userId,
    )
    var notContext = { workspaceId: workspaceId, userId: userId }
    expect(context.isContext(context)).toBeTruthy()
    expect(context.isContext(notContext)).toBeFalsy()
  })
  describe('isAdmin method', function () {
    var context
    beforeEach(function () {
      context = userOnWorkspaceContext_1.UserOnWorkspaceContext.create(
        mockDb_1.default,
        workspaceId,
        userId,
      )
    })
    it('should return true when user is an admin', function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var userOnWorkspace, result
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              userOnWorkspace =
                UsersOnWorkspacesFactory_1.UsersOnWorkspacesFactory.build({
                  userId: userId,
                  workspaceId: workspaceId,
                  role: globalTypesWrapper.UserRole.Admin,
                })
              mockDb_1.default.usersOnWorkspaces.findFirst.mockResolvedValueOnce(
                userOnWorkspace,
              )
              return [4 /*yield*/, context.isAdmin()]
            case 1:
              result = _a.sent()
              expect(result).toBeTruthy()
              return [2 /*return*/]
          }
        })
      })
    })
    it('should return false when user is not an admin', function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var userOnWorkspace, result
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              userOnWorkspace =
                UsersOnWorkspacesFactory_1.UsersOnWorkspacesFactory.build({
                  userId: userId,
                  workspaceId: workspaceId,
                  role: globalTypesWrapper.UserRole.Member,
                })
              mockDb_1.default.usersOnWorkspaces.findFirst.mockResolvedValueOnce(
                userOnWorkspace,
              )
              return [4 /*yield*/, context.isAdmin()]
            case 1:
              result = _a.sent()
              expect(result).toBeFalsy()
              return [2 /*return*/]
          }
        })
      })
    })
  })
  describe('isAdminOrThrow method', function () {
    var context
    beforeEach(function () {
      context = userOnWorkspaceContext_1.UserOnWorkspaceContext.create(
        mockDb_1.default,
        workspaceId,
        userId,
      )
    })
    it('should return true when user is an admin', function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var userOnWorkspace, result
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              userOnWorkspace =
                UsersOnWorkspacesFactory_1.UsersOnWorkspacesFactory.build({
                  userId: userId,
                  workspaceId: workspaceId,
                  role: globalTypesWrapper.UserRole.Admin,
                })
              mockDb_1.default.usersOnWorkspaces.findFirst.mockResolvedValueOnce(
                userOnWorkspace,
              )
              return [4 /*yield*/, context.isAdminOrThrow()]
            case 1:
              result = _a.sent()
              expect(result).toBeTruthy()
              return [2 /*return*/]
          }
        })
      })
    })
    it('should throw a TRPCError with code "UNAUTHORIZED" when user is not an admin', function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var userOnWorkspace, promise
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              userOnWorkspace =
                UsersOnWorkspacesFactory_1.UsersOnWorkspacesFactory.build({
                  userId: userId,
                  workspaceId: workspaceId,
                  role: globalTypesWrapper.UserRole.Member,
                })
              mockDb_1.default.usersOnWorkspaces.findFirst.mockResolvedValueOnce(
                userOnWorkspace,
              )
              promise = context.isAdminOrThrow()
              return [
                4 /*yield*/,
                expect(promise).rejects.toThrow(server_1.TRPCError),
              ]
            case 1:
              _a.sent()
              return [
                4 /*yield*/,
                expect(promise).rejects.toHaveProperty('code', 'UNAUTHORIZED'),
              ]
            case 2:
              _a.sent()
              return [
                4 /*yield*/,
                expect(promise).rejects.toEqual(
                  expect.objectContaining({
                    message: 'Only admins can perform this action',
                  }),
                ),
              ]
            case 3:
              _a.sent()
              return [2 /*return*/]
          }
        })
      })
    })
  })
})
