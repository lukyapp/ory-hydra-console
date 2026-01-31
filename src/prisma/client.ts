import 'dotenv/config';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import prismaConfig from '../../prisma.config';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const connectionString = prismaConfig.datasource?.url;
const adapter = new PrismaPg({
  connectionString,
});
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
