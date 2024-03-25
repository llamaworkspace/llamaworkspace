import { env } from '@/env.mjs'
import path from 'path'
import { Sequelize } from 'sequelize'
import { SequelizeStorage, Umzug } from 'umzug'
import { prisma } from '../db'
const sequelize = new Sequelize(env.DATABASE_URL)

export const migrator = new Umzug({
  migrations: {
    glob: ['data_migrations/*.ts', { cwd: path.join(__dirname, '../../..') }],
  },
  context: { prisma },
  storage: new SequelizeStorage({ sequelize, tableName: '_data_migrations' }),
  logger: console,
  create: {
    folder: 'data_migrations',
  },
})

void migrator
  .runAsCLI()
  .catch((error) => {
    console.error(error)
    throw error
  })
  .finally(() => {
    process.exit()
  })

export type DataMigrationContext = typeof migrator._types.migration
