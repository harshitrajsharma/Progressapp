import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { subjectId, phaseType, duration, skipBreaks } = body

    // Create focus session
    const focusSession = await prisma.focusSession.create({
      data: {
        userId: session.user.id,
        subjectId,
        startTime: new Date(),
        totalDuration: duration,
        isActive: true,
        phaseType,
        skipBreaks,
        breaks: 0,
        pausedDuration: 0
      }
    })

    return NextResponse.json({
      success: true,
      focusSession
    })
  } catch (error) {
    console.error("[STUDY_TIME_START]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 