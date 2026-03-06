import { createPrismaClient } from './client';
import { seedUsers } from './seeds/users';

const prisma = createPrismaClient();

async function main() {
  await seedUsers(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
