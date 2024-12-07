import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanDailyActivities() {
  try {
    // Get all daily activities
    const activities = await prisma.dailyActivity.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Group by userId and date
    const groupedActivities = activities.reduce((acc, activity) => {
      const key = `${activity.userId}-${activity.date.toISOString().split('T')[0]}`
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(activity)
      return acc
    }, {} as Record<string, typeof activities>)

    // For each group with duplicates, merge them
    for (const [key, group] of Object.entries(groupedActivities)) {
      if (group.length > 1) {
        console.log(`Found ${group.length} duplicates for ${key}`)
        
        // Keep the first one and merge study time from others
        const [keep, ...remove] = group
        const totalStudyTime = group.reduce((sum, act) => sum + act.studyTime, 0)
        const totalTopics = group.reduce((sum, act) => sum + act.topicsCount, 0)
        const totalTests = group.reduce((sum, act) => sum + act.testsCount, 0)

        // Update the one we're keeping
        await prisma.dailyActivity.update({
          where: { id: keep.id },
          data: {
            studyTime: totalStudyTime,
            topicsCount: totalTopics,
            testsCount: totalTests,
          }
        })

        // Delete the others
        for (const activity of remove) {
          await prisma.dailyActivity.delete({
            where: { id: activity.id }
          })
        }

        console.log(`Merged activities for ${key}`)
      }
    }

    console.log('Cleanup completed successfully')
  } catch (error) {
    console.error('Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDailyActivities() 