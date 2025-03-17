import { PrismaClient } from '@prisma/client';
import { startOfDay, subMonths } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting topic progress migration...');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true
      }
    });

    for (const user of users) {
      console.log(`Processing user ${user.id}...`);

      // Get all topics for this user
      const topics = await prisma.topic.findMany({
        where: {
          chapter: {
            subject: {
              userId: user.id
            }
          }
        },
        include: {
          chapter: {
            include: {
              subject: true
            }
          }
        }
      });

      // Create progress records for each completed topic
      for (const topic of topics) {
        const progressRecords = [];

        // Learning progress
        if (topic.learningStatus) {
          progressRecords.push({
            topicId: topic.id,
            userId: user.id,
            subjectId: topic.chapter.subject.id,
            type: 'learning',
            completed: true,
            // Use a date within last 3 months for historical data
            date: new Date(Date.now() - Math.random() * 7776000000) // Random date within last 90 days
          });
        }

        // Revision progress
        for (let i = 0; i < topic.revisionCount; i++) {
          progressRecords.push({
            topicId: topic.id,
            userId: user.id,
            subjectId: topic.chapter.subject.id,
            type: 'revision',
            completed: true,
            date: new Date(Date.now() - Math.random() * 7776000000)
          });
        }

        // Practice progress
        for (let i = 0; i < topic.practiceCount; i++) {
          progressRecords.push({
            topicId: topic.id,
            userId: user.id,
            subjectId: topic.chapter.subject.id,
            type: 'practice',
            completed: true,
            date: new Date(Date.now() - Math.random() * 7776000000)
          });
        }

        // Test progress
        for (let i = 0; i < topic.testCount; i++) {
          progressRecords.push({
            topicId: topic.id,
            userId: user.id,
            subjectId: topic.chapter.subject.id,
            type: 'test',
            completed: true,
            date: new Date(Date.now() - Math.random() * 7776000000)
          });
        }

        // Create all progress records for this topic
        if (progressRecords.length > 0) {
          await prisma.topicProgress.createMany({
            data: progressRecords
          });
        }
      }
    }

    console.log('Topic progress migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 