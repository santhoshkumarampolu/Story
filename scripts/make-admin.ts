// Run this script to make a user an admin
// Usage: npx ts-node scripts/make-admin.ts <email>

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { 
        isAdmin: true,
        subscriptionStatus: 'admin'
      }
    });
    
    console.log(`✅ User ${user.email} is now an admin`);
    console.log(`   Name: ${user.name}`);
    console.log(`   isAdmin: ${user.isAdmin}`);
    console.log(`   subscriptionStatus: ${user.subscriptionStatus}`);
  } catch (error) {
    console.error('❌ Error making user admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
if (!email) {
  console.log('Usage: npx ts-node scripts/make-admin.ts <email>');
  process.exit(1);
}

makeAdmin(email);
