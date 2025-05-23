import { PrismaClient } from '@prisma/client'

// This approach is recommended for Next.js projects deployed to Vercel
// to handle the serverless environment properly
declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma
