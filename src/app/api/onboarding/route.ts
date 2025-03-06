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

    // Ensure proper date handling
    const parsedExamDate = new Date(examDate + 'T00:00:00.000Z')
    if (isNaN(parsedExamDate.getTime())) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid exam date format" }),
        { status: 400 }
      )
    }

    // First, check if the user already has a dashboard
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { dashboard: true }
    })

    if (!existingUser) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Use a transaction to ensure both user and dashboard are updated atomically
    const updatedUser = await prisma.$transaction(async (tx) => {
      // If dashboard doesn't exist, create it
      if (!existingUser.dashboard) {
        await tx.dashboard.create({
          data: {
            userId: existingUser.id,
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
        })
      }

      // Update user details
      return await tx.user.update({
        where: { email: session.user.email },
        data: { 
          examName,
          examDate: parsedExamDate,
          targetScore: parseInt(targetScore),
          totalMarks: parseInt(totalMarks),
          targetMarks: parseInt(targetMarks)
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          examName: true,
          examDate: true,
          targetScore: true,
          totalMarks: true,
          targetMarks: true
        }
      })
    })

    // Return updated user data for session update
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        examName: updatedUser.examName,
        examDate: updatedUser.examDate,
        targetScore: updatedUser.targetScore,
        totalMarks: updatedUser.totalMarks,
        targetMarks: updatedUser.targetMarks,
        needsOnboarding: false
      }
    })
  } catch (error) {
    console.error("[ONBOARDING_ERROR]", error)
    return new NextResponse(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }),
      { status: 500 }
    )
  }
} 