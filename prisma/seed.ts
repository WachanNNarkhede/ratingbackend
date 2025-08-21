import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@storerating.com' },
    update: {},
    create: {
      name: 'System Administrator User',
      email: 'admin@storerating.com',
      password: adminPassword,
      address: '123 Admin Street, Admin City, AC 12345',
      role: 'ADMIN'
    }
  });

  // Create store owners
  const storeOwner1Password = await bcrypt.hash('Owner123!', 12);
  const storeOwner1 = await prisma.user.upsert({
    where: { email: 'owner1@example.com' },
    update: {},
    create: {
      name: 'John Smith Store Owner Manager',
      email: 'owner1@example.com',
      password: storeOwner1Password,
      address: '456 Business Ave, Commerce City, CC 67890',
      role: 'STORE_OWNER'
    }
  });

  const storeOwner2Password = await bcrypt.hash('Owner456!', 12);
  const storeOwner2 = await prisma.user.upsert({
    where: { email: 'owner2@example.com' },
    update: {},
    create: {
      name: 'Sarah Johnson Store Owner Manager',
      email: 'owner2@example.com',
      password: storeOwner2Password,
      address: '789 Retail Road, Shopping Town, ST 13579',
      role: 'STORE_OWNER'
    }
  });

  // Create normal users
  const normalUser1Password = await bcrypt.hash('User123!', 12);
  const normalUser1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      name: 'Alice Brown Normal User Customer',
      email: 'user1@example.com',
      password: normalUser1Password,
      address: '321 Customer Lane, User City, UC 24680',
      role: 'NORMAL_USER'
    }
  });

  const normalUser2Password = await bcrypt.hash('User456!', 12);
  const normalUser2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      name: 'Bob Wilson Normal User Customer',
      email: 'user2@example.com',
      password: normalUser2Password,
      address: '654 Buyer Boulevard, Customer Town, CT 97531',
      role: 'NORMAL_USER'
    }
  });

  // Create stores
  const store1 = await prisma.store.upsert({
    where: { email: 'contact@techstore.com' },
    update: {},
    create: {
      name: 'Tech Electronics Store',
      email: 'contact@techstore.com',
      address: '100 Technology Drive, Tech City, TC 11111',
      ownerId: storeOwner1.id
    }
  });

  const store2 = await prisma.store.upsert({
    where: { email: 'info@fashionboutique.com' },
    update: {},
    create: {
      name: 'Fashion Boutique Store',
      email: 'info@fashionboutique.com',
      address: '200 Fashion Street, Style City, SC 22222',
      ownerId: storeOwner2.id
    }
  });

  // Create ratings
  await prisma.rating.upsert({
    where: {
      userId_storeId: {
        userId: normalUser1.id,
        storeId: store1.id
      }
    },
    update: {},
    create: {
      userId: normalUser1.id,
      storeId: store1.id,
      rating: 5
    }
  });

  await prisma.rating.upsert({
    where: {
      userId_storeId: {
        userId: normalUser2.id,
        storeId: store1.id
      }
    },
    update: {},
    create: {
      userId: normalUser2.id,
      storeId: store1.id,
      rating: 4
    }
  });

  await prisma.rating.upsert({
    where: {
      userId_storeId: {
        userId: normalUser1.id,
        storeId: store2.id
      }
    },
    update: {},
    create: {
      userId: normalUser1.id,
      storeId: store2.id,
      rating: 3
    }
  });

  console.log('Database seeded successfully!');
  console.log('Test accounts created:');
  console.log('Admin: admin@storerating.com / Admin123!');
  console.log('Store Owner 1: owner1@example.com / Owner123!');
  console.log('Store Owner 2: owner2@example.com / Owner456!');
  console.log('Normal User 1: user1@example.com / User123!');
  console.log('Normal User 2: user2@example.com / User456!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });