import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function waitForConnection(maxAttempts = 5) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await prisma.$connect()
      console.log('Successfully connected to database')
      return true
    } catch (error) {
      console.error(`Connection attempt ${i + 1} failed:`, error)
      if (i < maxAttempts - 1) {
        console.log('Retrying in 5 seconds...')
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }
  }
  return false
}

async function backupData() {
  try {
    console.log('Starting database backup...')
    
    const connected = await waitForConnection()
    if (!connected) {
      throw new Error('Failed to connect to database after multiple attempts')
    }

    // Backup users first
    console.log('Backing up users...')
    const users = await prisma.user.findMany()
    
    // Backup subjects
    console.log('Backing up subjects...')
    const subjects = await prisma.subject.findMany({
      include: {
        chapters: {
          include: {
            topics: true
          }
        }
      }
    })

    // Backup daily activities
    console.log('Backing up daily activities...')
    const dailyActivities = await prisma.dailyActivity.findMany()

    // Backup study streaks
    console.log('Backing up study streaks...')
    const studyStreaks = await prisma.studyStreak.findMany()

    // Backup study goals
    console.log('Backing up study goals...')
    const studyGoals = await prisma.studyGoal.findMany()

    // Backup study phases
    console.log('Backing up study phases...')
    const studyPhases = await prisma.studyPhase.findMany()

    // Backup performance metrics
    console.log('Backing up performance metrics...')
    const performanceMetrics = await prisma.performanceMetrics.findMany()

    // Backup study plans
    console.log('Backing up study plans...')
    const studyPlans = await prisma.studyPlan.findMany({
      include: {
        dailyPlans: true
      }
    })

    // Backup study progress
    console.log('Backing up study progress...')
    const studyProgress = await prisma.studyProgress.findMany()

    // Backup test progress
    console.log('Backing up test progress...')
    const testProgress = await prisma.testProgress.findMany()

    const data = {
      users,
      subjects,
      dailyActivities,
      studyStreaks,
      studyGoals,
      studyPhases,
      performanceMetrics,
      studyPlans,
      studyProgress,
      testProgress,
      backupDate: new Date().toISOString()
    }

    const backupDir = path.join(process.cwd(), 'backup')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir)
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(backupDir, `backup-${timestamp}.json`)
    
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2))
    console.log(`Backup successfully created at ${backupPath}`)
    console.log(`Backed up:`)
    console.log(`- ${users.length} users`)
    console.log(`- ${subjects.length} subjects`)
    console.log(`- ${dailyActivities.length} daily activities`)
    console.log(`- ${studyStreaks.length} study streaks`)
    console.log(`- ${studyGoals.length} study goals`)
    console.log(`- ${studyPhases.length} study phases`)
    console.log(`- ${performanceMetrics.length} performance metrics`)
    console.log(`- ${studyPlans.length} study plans`)
    console.log(`- ${studyProgress.length} study progress records`)
    console.log(`- ${testProgress.length} test progress records`)

  } catch (error) {
    console.error('Error during backup:', error)
    if (error.code === 'P2010') {
      console.error('Database connection error. Please check:')
      console.error('1. Your MongoDB connection string in .env file')
      console.error('2. Network connectivity')
      console.error('3. MongoDB Atlas IP whitelist')
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

console.log('Starting backup process...')
backupData() 