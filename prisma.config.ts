import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Migrations need a non-pooled connection; PgBouncer's transaction
    // pooler (used by DATABASE_URL) doesn't support the advisory locks
    // Prisma Migrate relies on. Falls back to DATABASE_URL so `prisma
    // generate` (which needs no DB access) doesn't hard-fail when
    // DIRECT_URL isn't configured, e.g. during a build step.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || ''
  },
})