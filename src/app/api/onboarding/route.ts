import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { examName, examDate, targetScore, totalMarks, targetMarks } = body

    // Update user with exam details and target score
    await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        examName,
        examDate: new Date(examDate),
        targetScore: parseInt(targetScore),
        totalMarks: parseInt(totalMarks),
        targetMarks: parseInt(targetMarks),
        // Create dashboard for the user
        dashboard: {
          create: {
            overallProgress: 0,
            learningProgress: 0,
            revisionProgress: 0,
            practiceProgress: 0,
            testProgress: 0,
            currentScore: 0,
            predictedScore: 0,
            completedChapters: 0,
            totalChapters: 0,
            timeRequired: 0
          }
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[ONBOARDING_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 