import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Subject {
  id: string;
  name: string;
  overallProgress: number;
}

interface User {
  id: string;
  email: string;
  subjects: Subject[];
  studyStreak: any;
  dailyActivities: any[];
}

async function migrateData() {
  try {
    console.log('Starting data migration...');

    // 1. Get all users
    const users = await prisma.user.findMany({
      include: {
        subjects: true,
        studyStreak: true,
        dailyActivities: true
      }
    }) as User[];

    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      console.log(`Migrating data for user: ${user.email}`);

      // 2. Create initial study phase for each user
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 56); // 56 days from now

      const studyPhase = await prisma.studyPhase.create({
        data: {
          userId: user.id,
          name: 'Foundation',
          startDate: today,
          endDate: endDate,
          isActive: true,
          dailyGoals: {
            totalHours: 12,
            mathematicalSubjectHours: 3,
            coreSubjectHours: 6,
            revisionHours: 3,
            practiceQuestions: 30
          },
          subjectGroups: {
            mathematical: {
              activeSubjects: user.subjects
                .filter((s: Subject) => s.name.includes('Math'))
                .map((s: Subject) => ({
                  subjectId: s.id,
                  allocation: 180, // 3 hours in minutes
                  currentTopic: null
                })),
              rotationStrategy: 'weekly',
              lastRotation: today
            },
            core: {
              activeSubjects: user.subjects
                .filter((s: Subject) => !s.name.includes('Math'))
                .map((s: Subject) => ({
                  subjectId: s.id,
                  allocation: 360, // 6 hours in minutes
                  currentTopic: null
                })),
              rotationStrategy: 'daily',
              lastRotation: today
            },
            revision: {
              activeSubjects: user.subjects
                .filter((s: Subject) => s.overallProgress > 50)
                .map((s: Subject) => ({
                  subjectId: s.id,
                  allocation: 180, // 3 hours in minutes
                  currentTopic: null
                })),
              rotationStrategy: 'daily',
              lastRotation: today
            }
          },
          progress: {
            mathematical: { completed: 0, total: 100 },
            core: { completed: 0, total: 100 },
            revision: { completed: 0, total: 100 },
            overall: 0
          },
          adaptiveParams: {
            difficultyLevel: 1,
            paceMultiplier: 1,
            focusAreas: [],
            rotationTriggers: {
              performanceThreshold: 70,
              timeThreshold: 7 // days
            }
          }
        }
      });

      // 3. Create initial performance metrics for each subject
      for (const subject of user.subjects) {
        await prisma.performanceMetrics.create({
          data: {
            userId: user.id,
            subjectId: subject.id,
            date: today,
            metrics: {
              accuracy: 0,
              timeSpent: 0,
              confidenceScore: 0,
              practiceQuestions: {
                attempted: 0,
                correct: 0,
                timePerQuestion: 0
              },
              conceptualUnderstanding: 0,
              revisionEffectiveness: 0
            },
            weakAreas: [],
            strongAreas: [],
            recommendations: [],
            trends: {
              daily: [],
              weekly: [],
              conceptProgress: []
            }
          }
        });
      }

      // 4. Create initial daily schedule
      await prisma.dailySchedule.create({
        data: {
          userId: user.id,
          phaseId: studyPhase.id,
          date: today,
          schedule: {
            blocks: [],
            totalTimeAllocated: 0,
            targetCompletionRate: 100
          },
          completion: {
            completedBlocks: [],
            timeSpentByGroup: {
              mathematical: 0,
              core: 0,
              revision: 0
            },
            achievedRate: 0
          },
          performance: {
            focusScore: 0,
            efficiencyRate: 0,
            completionRate: 0,
            groupPerformance: {
              mathematical: 0,
              core: 0,
              revision: 0
            }
          },
          adaptiveScore: 0
        }
      });

      console.log(`Successfully migrated data for user: ${user.email}`);
    }

    console.log('Data migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateData()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 