import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  // Check if admin user already exists
  const adminExists = await prisma.user.findUnique({
    where: { email: process.env.ADMIN_EMAIL || 'admin@example.com' },
  });

  if (!adminExists) {
    // Hash the admin password
    const passwordHash = await argon2.hash(
      process.env.ADMIN_PASSWORD || 'admin123'
    );

    // Create the admin user
    const admin = await prisma.user.create({
      data: {
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        passwordHash,
        name: 'Admin User',
        role: 'ADMIN',
      },
    });

    console.log(`Created admin user with id: ${admin.id}`);
  } else {
    console.log('Admin user already exists, skipping creation');
  }

  // Create regular users if they don't exist
  const regularUsers = [
    { email: 'user1@example.com', name: 'User One' },
    { email: 'user2@example.com', name: 'User Two' },
    { email: 'user3@example.com', name: 'User Three' },
    { email: 'user4@example.com', name: 'User Four' },
    { email: 'user5@example.com', name: 'User Five' },
  ];

  // Default password for all regular users
  const defaultPasswordHash = await argon2.hash('password123');

  for (const userData of regularUsers) {
    const userExists = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!userExists) {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash: defaultPasswordHash,
          name: userData.name,
          role: 'USER', // Default role
        },
      });
      console.log(`Created regular user with id: ${user.id}`);
    } else {
      console.log(`User ${userData.email} already exists, skipping creation`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
