import * as argon2 from 'argon2';
import { PrismaClient } from 'src/generated/prisma/client';
import { toArgon2Hash } from 'src/common/types/argon2-hash.type';

export async function seedUsers(prisma: PrismaClient) {
  const password = toArgon2Hash(await argon2.hash('password123'));

  await prisma.user.createMany({
    data: [
      {
        email: 'john.doe@example.com',
        name: 'John Doe',
        password,
      },
      {
        email: 'walter.white@example.com',
        name: 'Walter White',
        password,
      },
      {
        email: 'jesse.pinkman@example.com',
        name: 'Jesse Pinkman',
        password,
        role: 'ADMIN',
      },
    ],
  });
}
