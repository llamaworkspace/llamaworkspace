import { env } from '@/env.mjs'
import { Sequelize } from 'sequelize'
import { SequelizeStorage, Umzug } from 'umzug'
const sequelize = new Sequelize(env.DATABASE_URL)

export const migrator = new Umzug({
  migrations: {
    // glob: ['data_migrations/*.ts', { cwd: path.join(__dirname, '../../..') }],
    glob: ['data_migrations/*.ts', { cwd: process.cwd() }],
  },
  storage: new SequelizeStorage({ sequelize, tableName: '_data_migrations' }),
  logger: console,
  create: {
    folder: 'data_migrations',
  },
})

void migrator.runAsCLI().finally(() => {
  process.exit()
})

export type DataMigration = typeof migrator._types.migration
