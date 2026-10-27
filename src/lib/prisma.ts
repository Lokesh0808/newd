import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client.
 *
 * In development Next.js hot-reloads modules on every change, which would
 * otherwise open a new connection pool on each reload until Postgres refuses
 * new connections. Storing the instance on `globalThis` avoids that.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
