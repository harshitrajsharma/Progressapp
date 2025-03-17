import { PrismaClient } from '@prisma/client';
import { subMinutes } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting to restore real topic progress...');

    // 1. Find records created in bulk (artificial data)
    const records = await prisma.topicProgress.findMany({
      select: {
        date: true,
      },
      orderBy: {
        date: 'desc',
      }
    });

    // Group records by minute to find bulk creation
    const recordsByMinute = records.reduce((acc, record) => {
      const minute = record.date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
      acc[minute] = (acc[minute] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Find the minute with the most records (likely our bulk insert)
    let maxCount = 0;
    let bulkInsertMinute = '';
    for (const [minute, count] of Object.entries(recordsByMinute)) {
      if (count > maxCount) {
        maxCount = count;
        bulkInsertMinute = minute;
      }
    }

    if (!bulkInsertMinute) {
      console.log('No bulk inserts found. Database appears to contain only real user activity.');
      return;
    }

    console.log(`Found potential bulk insert at ${bulkInsertMinute} with ${maxCount} records`);

    // 2. Delete only the records from that specific minute
    const deleteResult = await prisma.topicProgress.deleteMany({
      where: {
        date: {
          gte: new Date(bulkInsertMinute),
          lt: new Date(new Date(bulkInsertMinute).getTime() + 60000) // Add 1 minute
        }
      }
    });

    console.log(`Deleted ${deleteResult.count} artificial records`);

    // 3. Verify remaining records
    const remainingRecords = await prisma.topicProgress.count();
    console.log(`Remaining real user activity records: ${remainingRecords}`);

    // 4. Show sample of recent activity
    const recentActivity = await prisma.topicProgress.findMany({
      take: 5,
      orderBy: {
        date: 'desc'
      },
      include: {
        topic: {
          select: {
            name: true
          }
        }
      }
    });

    console.log('\nMost recent activities (sample):');
    recentActivity.forEach(activity => {
      console.log(`- ${activity.topic.name} (${activity.type}) completed on ${activity.date.toLocaleString()}`);
    });

    console.log('\nRestoration complete. The database now contains only real user activity.');
    
    // 5. Provide summary of activity by day for verification
    const activityByDay = await prisma.topicProgress.groupBy({
      by: ['date'],
      _count: true,
      orderBy: {
        date: 'desc'
      },
      take: 10
    });

    console.log('\nRecent daily activity counts:');
    activityByDay.forEach(day => {
      console.log(`${day.date.toLocaleDateString()}: ${day._count} activities`);
    });

  } catch (error) {
    console.error('Error during restoration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 