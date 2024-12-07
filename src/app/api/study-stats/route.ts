import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const url = new URL(req.url)
    const range = url.searchParams.get("range") || "day"
    const date = url.searchParams.get("date") ? new Date(url.searchParams.get("date")!) : new Date()

    // Set time to start of day
    date.setHours(0, 0, 0, 0)

    let startDate = new Date(date)
    let endDate = new Date(date)

    switch (range) {
      case "week":
        startDate.setDate(date.getDate() - 6) // Last 7 days including today
        break
      case "month":
        startDate.setDate(1) // Start of current month
        endDate.setMonth(endDate.getMonth() + 1, 0) // End of current month
        break
      case "year":
        startDate.setMonth(0, 1) // Start of current year
        endDate.setMonth(11, 31) // End of current year
        break
      default: // day
        endDate.setHours(23, 59, 59, 999)
        break
    }

    // Get daily activities for the date range
    const dailyActivities = await prisma.dailyActivity.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Get current streak
    const streak = await prisma.studyStreak.findUnique({
      where: {
        userId: session.user.id
      }
    })

    // Get focus sessions for the date range
    const focusSessions = await prisma.focusSession.findMany({
      where: {
        userId: session.user.id,
        startTime: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    })

    // Calculate statistics
    const stats = {
      totalStudyTime: 0,
      learningTime: 0,
      revisionTime: 0,
      practiceTime: 0,
      averageProductivity: 0,
      averageFocusScore: 0,
      totalInterruptions: 0,
      completedSessions: 0,
      goalCompletionRate: 0,
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      dailyBreakdown: dailyActivities.map(activity => ({
        date: activity.date,
        studyTime: activity.studyTime,
        goalCompleted: activity.goalCompleted,
        productivity: activity.productivity,
        focusScore: activity.focusScore,
        interruptions: activity.interruptions,
        learningTime: activity.learningTime,
        revisionTime: activity.revisionTime,
        practiceTime: activity.practiceTime
      })),
      recentSessions: focusSessions.slice(0, 5).map(session => ({
        id: session.id,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.totalDuration,
        status: session.status,
        phaseType: session.phaseType,
        metrics: session.metrics
      }))
    }

    // Calculate aggregates
    if (dailyActivities.length > 0) {
      stats.totalStudyTime = dailyActivities.reduce((sum, day) => sum + day.studyTime, 0)
      stats.learningTime = dailyActivities.reduce((sum, day) => sum + day.learningTime, 0)
      stats.revisionTime = dailyActivities.reduce((sum, day) => sum + day.revisionTime, 0)
      stats.practiceTime = dailyActivities.reduce((sum, day) => sum + day.practiceTime, 0)
      stats.averageProductivity = dailyActivities.reduce((sum, day) => sum + day.productivity, 0) / dailyActivities.length
      stats.averageFocusScore = dailyActivities.reduce((sum, day) => sum + day.focusScore, 0) / dailyActivities.length
      stats.totalInterruptions = dailyActivities.reduce((sum, day) => sum + day.interruptions, 0)
      stats.completedSessions = focusSessions.filter(s => s.status === 'completed').length
      stats.goalCompletionRate = (dailyActivities.filter(d => d.goalCompleted).length / dailyActivities.length) * 100
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error("[STUDY_STATS]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 