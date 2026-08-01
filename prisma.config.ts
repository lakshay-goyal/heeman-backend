import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Migrations need a non-pooled connection; PgBouncer's transaction
    // pooler (used by DATABASE_URL) doesn't support the advisory locks
    // Prisma Migrate relies on.
    url: env('DIRECT_URL')
  },
})