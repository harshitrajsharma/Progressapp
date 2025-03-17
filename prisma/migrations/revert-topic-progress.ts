import { PrismaClient } from '@prisma/client';
import { subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting to revert topic progress...');

    // Calculate the date 90 days ago when we started adding artificial records
    const ninetyDaysAgo = subDays(new Date(), 90);

    // Delete all TopicProgress records created in the last 90 days
    const result = await prisma.topicProgress.deleteMany({
      where: {
        date: {
          gte: ninetyDaysAgo
        }
      }
    });

    console.log(`Successfully deleted ${result.count} artificial topic progress records.`);
    console.log('Database has been reverted to its state before the artificial data was added.');
  } catch (error) {
    console.error('Error during reversion:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 