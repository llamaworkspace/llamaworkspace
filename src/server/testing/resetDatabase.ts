import type { PrismaClient } from '@prisma/client'

export async function resetDatabase(prisma: PrismaClient) {
  try {
    // Start a transaction
    await prisma.$transaction(async (prisma) => {
      // Get a list of all table names (this example is for PostgreSQL, adjust for your DBMS)
      const tables: { tablename: string }[] =
        await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = 'public';`

      // Construct a query to truncate all tables
      const queries = tables
        .filter((table) => table.tablename !== '_prisma_migrations')
        .map((table) =>
          prisma.$executeRawUnsafe(
            `TRUNCATE TABLE "${table.tablename}" CASCADE;`,
          ),
        )

      // Execute all truncate queries
      await Promise.all(queries)
    })
  } catch (error) {
    console.error('Error resetting database: ', error)
  } finally {
    await prisma.$disconnect()
  }
}
