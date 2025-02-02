import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting migration: Adding UserSettings...');

    // 1. Get all existing users
    const existingUsers = await prisma.user.findMany({
      select: {
        email: true,
        settings: true
      }
    });

    console.log(`Found ${existingUsers.length} users to migrate`);

    // 2. Create default settings for users who don't have them
    for (const user of existingUsers) {
      if (user.email && !user.settings) {
        console.log(`Creating default settings for user: ${user.email}`);
        
        await prisma.userSettings.create({
          data: {
            userEmail: user.email,
            emailNotifications: true,
            progressReminders: true,
            testReminders: true,
          }
        });
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  }); 