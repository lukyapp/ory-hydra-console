import { databaseExecute } from '@/prisma/database-execute';

async function main() {}

main()
  .then(async () => {
    await databaseExecute((prisma) => prisma.$disconnect());
  })
  .catch(async (e) => {
    console.error(e);
    await databaseExecute((prisma) => prisma.$disconnect());
    process.exit(1);
  });
