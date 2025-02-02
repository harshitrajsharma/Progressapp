import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function createUserSettings(email: string) {
  try {
    const result = await prisma.$runCommandRaw({
      insert: 'UserSettings',
      documents: [{
        _id: new Date().getTime().toString(),
        userEmail: email,
        emailNotifications: true,
        progressReminders: true,
        testReminders: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }]
    });
    console.log(`Successfully created settings for: ${email}`);
    return true;
  } catch (error: any) {
    if (error.code === 11000) { // Duplicate key error
      console.log(`Settings already exist for ${email}, skipping...`);
      return true;
    }
    console.error(`Failed to create settings for ${email}:`, error);
    return false;
  }
}

async function migrateUserSettings() {
  try {
    console.log('Starting user settings migration...');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        email: true,
      },
    });

    console.log(`Found ${users.length} users to process`);

    // Process each user
    for (const user of users) {
      if (!user.email) continue;

      try {
        // Check if settings exist
        const existingSettings = await prisma.userSettings.findUnique({
          where: { userEmail: user.email }
        });

        if (!existingSettings) {
          console.log(`Creating settings for user: ${user.email}`);
          await createUserSettings(user.email);
        } else {
          console.log(`Settings already exist for: ${user.email}`);
        }
      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error);
      }

      // Small delay between operations
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateUserSettings()
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  }); 