import { PrismaClient } from 'generated/prisma/client';

export async function seedUsers(prisma: PrismaClient) {
  await prisma.user.createMany({
    data: [
      {
        email: 'john.doe@example.com',
        name: 'John Doe',
      },
      {
        email: 'walter.white@example.com',
        name: 'Walter White',
      },
      {
        email: 'jesse.pinkman@example.com',
        name: 'Jesse Pinkman',
      },
    ],
  });
}
