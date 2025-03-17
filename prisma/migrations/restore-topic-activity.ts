import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting to restore topic activity from actual topic completion data...');

    // First, clear all existing TopicProgress records to start fresh
    await prisma.topicProgress.deleteMany({});
    console.log('Cleared existing TopicProgress records');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true
      }
    });

    for (const user of users) {
      console.log(`Processing user ${user.id}...`);

      // Get all completed topics for this user with their completion data
      const topics = await prisma.topic.findMany({
        where: {
          OR: [
            { learningStatus: true },
            { revisionCount: { gt: 0 } },
            { practiceCount: { gt: 0 } },
            { testCount: { gt: 0 } }
          ],
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
        },
        orderBy: {
          updatedAt: 'asc' // Get them in order of completion
        }
      });

      console.log(`Found ${topics.length} topics with progress for user ${user.id}`);

      // Create progress records for each topic's actual completion
      for (const topic of topics) {
        const progressRecords = [];

        // Learning progress - use topic's updatedAt as the completion time
        if (topic.learningStatus) {
          progressRecords.push({
            topicId: topic.id,
            userId: user.id,
            subjectId: topic.chapter.subject.id,
            type: 'learning',
            completed: true,
            date: topic.updatedAt
          });
        }

        // Revision progress - space out the completions
        for (let i = 0; i < topic.revisionCount; i++) {
          progressRecords.push({
            topicId: topic.id,
            userId: user.id,
            subjectId: topic.chapter.subject.id,
            type: 'revision',
            completed: true,
            date: new Date(topic.updatedAt.getTime() + (i * 24 * 60 * 60 * 1000)) // Space out by 1 day each
          });
        }

        // Practice progress - space out the completions
        for (let i = 0; i < topic.practiceCount; i++) {
          progressRecords.push({
            topicId: topic.id,
            userId: user.id,
            subjectId: topic.chapter.subject.id,
            type: 'practice',
            completed: true,
            date: new Date(topic.updatedAt.getTime() + (i * 24 * 60 * 60 * 1000)) // Space out by 1 day each
          });
        }

        // Test progress - space out the completions
        for (let i = 0; i < topic.testCount; i++) {
          progressRecords.push({
            topicId: topic.id,
            userId: user.id,
            subjectId: topic.chapter.subject.id,
            type: 'test',
            completed: true,
            date: new Date(topic.updatedAt.getTime() + (i * 24 * 60 * 60 * 1000)) // Space out by 1 day each
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

    // Verify the restoration
    const totalProgressRecords = await prisma.topicProgress.count();
    console.log(`\nRestoration complete! Created ${totalProgressRecords} topic progress records.`);

    // Show sample of restored activity
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

  } catch (error) {
    console.error('Error during restoration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 