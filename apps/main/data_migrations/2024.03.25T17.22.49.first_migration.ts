import type { MigrationFn } from 'umzug'

export const up: MigrationFn = async ({ context }) => {
  await Promise.resolve()
  console.log('Empty first migration UP')
}
export const down: MigrationFn = async ({ context }) => {
  await Promise.resolve()
  console.log('Empty first migration DOWN')
}
