import type { MigrationFn } from 'umzug'
import type { DataMigrationContext } from '../src/server/dataMigrations/dataMigrator'
export const up: MigrationFn<DataMigrationContext> = async ({ prisma }) => {
  console.log('Empty first migration UP')
}
export const down: MigrationFn<DataMigrationContext> = async ({ prisma }) => {
  console.log('Empty first migration DOWN')
}
