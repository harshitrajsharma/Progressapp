import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const { duration, subjectId, phaseType } = json

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        studyStreak: true,
        dailyActivities: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }
      }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Get or create today's activity
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let dailyActivity = user.dailyActivities[0]

    if (!dailyActivity) {
      dailyActivity = await prisma.dailyActivity.create({
        data: {
          userId: user.id,
          date: today,
          studyTime: duration,
          topicsCount: 0,
          testsCount: 0
        }
      })
    } else {
      dailyActivity = await prisma.dailyActivity.update({
        where: { id: dailyActivity.id },
        data: {
          studyTime: dailyActivity.studyTime + duration
        }
      })
    }

    // Update subject progress based on phase type
    if (subjectId && phaseType) {
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId }
      })

      if (subject) {
        const progressField = `${phaseType}Progress` as keyof typeof subject
        const currentProgress = subject[progressField] as number || 0
        const weightedProgress = Math.min(100, currentProgress + (duration / 60) * 0.5)

        await prisma.subject.update({
          where: { id: subjectId },
          data: {
            [progressField]: weightedProgress,
            overallProgress: (subject.learningProgress + subject.revisionProgress + subject.practiceProgress + subject.testProgress) / 4
          }
        })
      }
    }

    // Update study streak
    const streak = user.studyStreak
    let currentStreak = 0

    if (streak) {
      const lastStudyDate = new Date(streak.lastStudyDate)
      const today = new Date()
      const diffDays = Math.floor((today.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24))

      let newStreak = streak.currentStreak
      if (diffDays === 0) {
        // Same day, no change
        currentStreak = newStreak
      } else if (diffDays === 1) {
        // Next day, increment streak
        newStreak += 1
        currentStreak = newStreak
      } else {
        // Streak broken
        newStreak = 1
        currentStreak = newStreak
      }

      await prisma.studyStreak.update({
        where: { id: streak.id },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(streak.longestStreak, newStreak),
          dailyProgress: Math.floor(dailyActivity.studyTime / 60),
          lastStudyDate: new Date()
        }
      })
    }

    return NextResponse.json({
      dailyActivity,
      currentStreak
    })
  } catch (error) {
    console.error("[STUDY_TIME_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 