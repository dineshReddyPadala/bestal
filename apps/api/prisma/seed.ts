import argon2 from 'argon2';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('Password123!');

  const organization = await prisma.organization.upsert({
    where: { slug: 'bestal-demo' },
    update: {},
    create: {
      name: 'BesTal Demo Org',
      slug: 'bestal-demo',
    },
  });

  const users = [
    {
      email: 'admin@bestal.com',
      firstName: 'Platform',
      lastName: 'Admin',
      role: Role.ADMIN,
    },
    {
      email: 'recruiter@bestal.com',
      firstName: 'Demo',
      lastName: 'Recruiter',
      role: Role.RECRUITER,
    },
    {
      email: 'sales@bestal.com',
      firstName: 'Demo',
      lastName: 'Sales',
      role: Role.SALES,
    },
    {
      email: 'client@bestal.com',
      firstName: 'Demo',
      lastName: 'Client',
      role: Role.CLIENT,
    },
  ] as const;

  for (const entry of users) {
    const user = await prisma.user.upsert({
      where: { email: entry.email },
      update: {},
      create: {
        email: entry.email,
        passwordHash,
        firstName: entry.firstName,
        lastName: entry.lastName,
      },
    });

    await prisma.membership.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: organization.id,
        },
      },
      update: { role: entry.role },
      create: {
        userId: user.id,
        organizationId: organization.id,
        role: entry.role,
      },
    });

    console.log(`${entry.role}: ${entry.email} / Password123!`);
  }

  console.log('Seed completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
