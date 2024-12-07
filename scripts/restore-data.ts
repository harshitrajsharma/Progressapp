import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function restoreData() {
  try {
    // Get the latest backup file
    const backupDir = path.join(process.cwd(), 'backup')
    const files = fs.readdirSync(backupDir)
    const latestBackup = files
      .filter(f => f.startsWith('backup-'))
      .sort()
      .reverse()[0]

    if (!latestBackup) {
      throw new Error('No backup file found')
    }

    const backupPath = path.join(backupDir, latestBackup)
    const data = JSON.parse(fs.readFileSync(backupPath, 'utf-8'))

    // Restore data in the correct order
    for (const user of data.users) {
      // Create user
      const { subjects, dashboard, studyStreak, dailyActivities, studyGoals,
              studyPhases, dailySchedules, performanceMetrics, studyPlans,
              studyProgress, gateTests, testProgress, ...userData } = user

      const createdUser = await prisma.user.create({
        data: {
          ...userData,
          subjects: {
            create: subjects.map(subject => {
              const { chapters, tests, mockTests, ...subjectData } = subject
              return {
                ...subjectData,
                chapters: {
                  create: chapters.map(chapter => {
                    const { topics, ...chapterData } = chapter
                    return {
                      ...chapterData,
                      topics: {
                        create: topics
                      }
                    }
                  })
                },
                tests: {
                  create: tests
                },
                mockTests: {
                  create: mockTests
                }
              }
            })
          },
          dashboard: dashboard ? {
            create: dashboard
          } : undefined,
          studyStreak: studyStreak ? {
            create: studyStreak
          } : undefined,
          dailyActivities: {
            create: dailyActivities
          },
          studyGoals: {
            create: studyGoals
          },
          studyPhases: {
            create: studyPhases
          },
          dailySchedules: {
            create: dailySchedules
          },
          performanceMetrics: {
            create: performanceMetrics
          },
          studyPlans: {
            create: studyPlans.map(plan => {
              const { dailyPlans, ...planData } = plan
              return {
                ...planData,
                dailyPlans: {
                  create: dailyPlans
                }
              }
            })
          },
          studyProgress: {
            create: studyProgress
          },
          gateTests: {
            create: gateTests
          },
          testProgress: {
            create: testProgress
          }
        }
      })

      console.log(`Restored user: ${createdUser.email}`)
    }

    console.log('Data restoration completed successfully')
  } catch (error) {
    console.error('Error during restoration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restoreData() 