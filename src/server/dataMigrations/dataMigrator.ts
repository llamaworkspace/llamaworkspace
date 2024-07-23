import { env } from '@/env.mjs'
import path from 'path'
import { Sequelize } from 'sequelize'
import { SequelizeStorage, Umzug } from 'umzug'

const sequelize = new Sequelize(env.DATABASE_URL)

export const migrator = new Umzug({
  migrations: {
    glob: ['data_migrations/*.ts', { cwd: path.join(__dirname, '../../..') }],
  },
  storage: new SequelizeStorage({ sequelize, tableName: '_data_migrations' }),
  logger: console,
  create: {
    folder: 'data_migrations',
  },
})

void migrator
  .runAsCLI()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })

export type DataMigration = typeof migrator._types.migration
