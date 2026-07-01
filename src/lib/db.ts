// This file creates and exports the database connection that the rest of the app uses to
// read and write data. It makes sure only one connection is kept open at a time, even
// during development when the server restarts frequently.

import { PrismaClient } from "@/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

// Creates a fresh database connection pointing to the URL in the environment variables.
function createPrismaClient() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  })
  return new PrismaClient({ adapter })
}

// Stores the database client on the global object so it survives hot reloads in development.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Reuses the existing connection if one already exists, otherwise creates a new one.
export const db = globalForPrisma.prisma ?? createPrismaClient()

// In development, saves the connection to the global object to avoid creating too many connections.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
