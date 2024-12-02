require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

// Create Prisma client with debug logging
const prisma = new PrismaClient({
  log: ['warn', 'error'],
})

async function updateSubjectPositions() {
  console.log('Starting subject position update...')
  
  try {
    // Get all subjects ordered by creation date
    const subjects = await prisma.subject.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        userId: true,
        expectedMarks: true,
        foundationLevel: true,
        overallProgress: true,
        learningProgress: true,
        revisionProgress: true,
        practiceProgress: true,
        testProgress: true,
      }
    })

    console.log(`Found ${subjects.length} subjects to update`)

    // Group subjects by userId
    const subjectsByUser = subjects.reduce((acc, subject) => {
      if (!acc[subject.userId]) {
        acc[subject.userId] = []
      }
      acc[subject.userId].push(subject)
      return acc
    }, {})

    // Update positions for each user's subjects
    for (const userId in subjectsByUser) {
      const userSubjects = subjectsByUser[userId]
      console.log(`Updating ${userSubjects.length} subjects for user ${userId}`)

      for (let i = 0; i < userSubjects.length; i++) {
        const subject = userSubjects[i]
        try {
          await prisma.subject.update({
            where: { id: subject.id },
            data: {
              position: i,
              expectedMarks: subject.expectedMarks ?? 0,
              foundationLevel: subject.foundationLevel ?? 'Beginner',
              overallProgress: subject.overallProgress ?? 0,
              learningProgress: subject.learningProgress ?? 0,
              revisionProgress: subject.revisionProgress ?? 0,
              practiceProgress: subject.practiceProgress ?? 0,
              testProgress: subject.testProgress ?? 0,
            }
          })
          console.log(`Updated subject: ${subject.name} with position: ${i}`)
        } catch (updateError) {
          console.error(`Failed to update subject ${subject.name}:`, updateError)
        }
      }
    }

    console.log('Subject position update completed successfully')
  } catch (error) {
    console.error('Error during subject position update:', error)
    throw error
  }
}

// Execute the update
async function main() {
  try {
    await updateSubjectPositions()
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    console.log('Database connection closed')
  }
}

main()
