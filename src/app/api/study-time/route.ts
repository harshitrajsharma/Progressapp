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
    const { duration, endTime } = json

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

    // Update study streak
    const streak = user.studyStreak
    if (streak) {
      await prisma.studyStreak.update({
        where: { id: streak.id },
        data: {
          dailyProgress: Math.floor(dailyActivity.studyTime / 60), // Convert to hours
          lastStudyDate: new Date()
        }
      })
    }

    return NextResponse.json(dailyActivity)
  } catch (error) {
    console.error("[STUDY_TIME_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 