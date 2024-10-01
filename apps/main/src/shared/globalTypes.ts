import type { Prisma, PrismaClient } from '@prisma/client'
import type { DefaultArgs } from '@prisma/client/runtime/library'

export enum UserRole {
  Admin = 'admin',
  Member = 'member',
}

export enum UserAccessLevel {
  Owner = 'owner',
  Edit = 'edit',
  EditWithoutInvite = 'edit_without_invite',
  Invite = 'invite',
  Use = 'use',
}

export enum UserAccessLevelActions {
  Owner = UserAccessLevel.Owner,
  Edit = UserAccessLevel.Edit,
  EditWithoutInvite = UserAccessLevel.EditWithoutInvite,
  Invite = UserAccessLevel.Invite,
  Use = UserAccessLevel.Use,
  Remove = 'remove',
}

export enum ShareScope {
  Private = 'private',
  User = 'user',
  Everybody = 'everybody',
}

export enum SidebarInfoCardType {
  Onboarding = 'onboarding',
}

export enum KeyValueType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
}

export enum InitialModel {
  Openai = 'openai',
  Llama = 'llama',
}

export enum AssetOnAppStatus {
  Processing = 'processing',
  Success = 'success',
  Failed = 'failed',
}

export type SimplePrimitive = string | number | boolean

export type PrismaTrxClient = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

export type PrismaClientOrTrxClient = PrismaClient | PrismaTrxClient

export type FetchError = Error & {
  cause?: {
    code?: string
  }
}
