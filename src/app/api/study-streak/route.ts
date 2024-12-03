import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    let streak = await prisma.studyStreak.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    })

    // If no streak exists, create one
    if (!streak) {
      streak = await prisma.studyStreak.create({
        data: {
          user: {
            connect: {
              email: session.user.email
            }
          },
          currentStreak: 0,
          longestStreak: 0,
          lastStudyDate: new Date(),
          dailyGoals: 6, // Default 6 hours daily goal
          dailyProgress: 0
        }
      })
    }

    return NextResponse.json(streak)
  } catch (error) {
    console.error("[STUDY_STREAK_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const { dailyProgress } = json

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { studyStreak: true }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Update or create streak
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const lastStudyDate = user.studyStreak?.lastStudyDate
    const isConsecutive = lastStudyDate ? 
      new Date(lastStudyDate).getTime() === today.getTime() - 86400000 : false

    const streak = await prisma.studyStreak.upsert({
      where: {
        userId: user.id
      },
      create: {
        userId: user.id,
        currentStreak: 1,
        longestStreak: 1,
        lastStudyDate: today,
        dailyGoals: 6,
        dailyProgress: dailyProgress
      },
      update: {
        currentStreak: isConsecutive ? { increment: 1 } : 1,
        longestStreak: isConsecutive ? 
          Math.max((user.studyStreak?.longestStreak || 0), (user.studyStreak?.currentStreak || 0) + 1) : 
          Math.max((user.studyStreak?.longestStreak || 0), 1),
        lastStudyDate: today,
        dailyProgress: dailyProgress
      }
    })

    return NextResponse.json(streak)
  } catch (error) {
    console.error("[STUDY_STREAK_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 