import { prisma } from '@/prisma/client';

export function databaseExecute<TProcessResult>(
  prismaCallback: (prismaClient: typeof prisma) => TProcessResult,
) {
  try {
    return prismaCallback(prisma);
  } catch (error: unknown) {
    console.error(error);
    throw new Error('Database error');
  }
}
