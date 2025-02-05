const { PrismaClient } = require('@prisma/client');
const { ObjectId } = require('mongodb');

const prisma = new PrismaClient();

interface MigrationStats {
  totalTopics: number;
  processedTopics: number;
  successfulMigrations: number;
  failedMigrations: number;
  errors: Array<{ topicId: string; error: string }>;
}

async function validateMigration(stats: MigrationStats) {
  // Verify all topics have been processed
  const totalProgressEntries = await prisma.topicProgress.count();
  const expectedEntries = stats.successfulMigrations;

  if (totalProgressEntries !== expectedEntries) {
    throw new Error(`Migration validation failed: Expected ${expectedEntries} entries but found ${totalProgressEntries}`);
  }

  console.log('Migration validation passed ✓');
  return true;
}

async function rollbackMigration(beforeDate: Date) {
  console.log('Rolling back migration...');
  try {
    const deletedCount = await prisma.topicProgress.deleteMany({
      where: {
        date: {
          gte: beforeDate
        }
      }
    });
    console.log(`Rolled back ${deletedCount.count} progress entries`);
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
}

async function migrateTopicProgress() {
  console.log('Starting migration of topic progress...');
  const migrationStartTime = new Date();
  
  const stats: MigrationStats = {
    totalTopics: 0,
    processedTopics: 0,
    successfulMigrations: 0,
    failedMigrations: 0,
    errors: []
  };

  try {
    // Get all topics with their relations
    const topics = await prisma.topic.findMany({
      include: {
        chapter: {
          include: {
            subject: true
          }
        }
      }
    });

    stats.totalTopics = topics.length;
    console.log(`Found ${topics.length} topics to migrate`);

    // Process each topic in batches
    for (const topic of topics) {
      try {
        const progressEntries = [];

        // Learning status
        if (topic.learningStatus) {
          progressEntries.push({
            id: new ObjectId().toString(),
            topicId: topic.id,
            userId: topic.chapter.subject.userId,
            subjectId: topic.chapter.subject.id,
            type: "learning",
            completed: true,
            date: topic.updatedAt
          });
        }

        // Revision progress
        for (let i = 0; i < topic.revisionCount; i++) {
          progressEntries.push({
            id: new ObjectId().toString(),
            topicId: topic.id,
            userId: topic.chapter.subject.userId,
            subjectId: topic.chapter.subject.id,
            type: "revision",
            completed: true,
            date: topic.lastRevised || topic.updatedAt
          });
        }

        // Practice progress
        for (let i = 0; i < topic.practiceCount; i++) {
          progressEntries.push({
            id: new ObjectId().toString(),
            topicId: topic.id,
            userId: topic.chapter.subject.userId,
            subjectId: topic.chapter.subject.id,
            type: "practice",
            completed: true,
            date: topic.updatedAt
          });
        }

        // Test progress
        for (let i = 0; i < topic.testCount; i++) {
          progressEntries.push({
            id: new ObjectId().toString(),
            topicId: topic.id,
            userId: topic.chapter.subject.userId,
            subjectId: topic.chapter.subject.id,
            type: "test",
            completed: true,
            date: topic.updatedAt
          });
        }

        // Create all progress entries for this topic
        if (progressEntries.length > 0) {
          // Create entries one by one to avoid skipDuplicates issue
          for (const entry of progressEntries) {
            await prisma.topicProgress.create({
              data: entry
            });
          }
          stats.successfulMigrations += progressEntries.length;
          console.log(`✓ Migrated ${progressEntries.length} progress entries for topic ${topic.name}`);
        }

        stats.processedTopics++;
      } catch (error) {
        console.error(`Error migrating topic ${topic.id}:`, error);
        stats.failedMigrations++;
        stats.errors.push({
          topicId: topic.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Validate migration
    const isValid = await validateMigration(stats);
    if (!isValid) {
      throw new Error('Migration validation failed');
    }

    console.log('\nMigration Summary:');
    console.log('------------------');
    console.log(`Total topics processed: ${stats.processedTopics}/${stats.totalTopics}`);
    console.log(`Successful migrations: ${stats.successfulMigrations}`);
    console.log(`Failed migrations: ${stats.failedMigrations}`);
    
    if (stats.errors.length > 0) {
      console.log('\nErrors encountered:');
      stats.errors.forEach(({ topicId, error }) => {
        console.log(`- Topic ${topicId}: ${error}`);
      });
    }

  } catch (error) {
    console.error('Migration failed:', error);
    await rollbackMigration(migrationStartTime);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateTopicProgress()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 