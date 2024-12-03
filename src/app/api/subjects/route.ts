import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  weightage: z.number().min(0).max(100),
  foundationLevel: z.enum(["Beginner", "Moderate", "Advanced"]),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("You must be logged in to create subjects", { status: 401 })
    }

    const json = await req.json()
    const body = subjectSchema.parse(json)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subjects: {
          orderBy: {
            position: 'asc'
          }
        }
      }
    })

    if (!user) {
      return new NextResponse("User account not found", { status: 404 })
    }

    // Get the highest position
    const highestPosition = user.subjects.length > 0
      ? Math.max(...user.subjects.map(s => s.position))
      : -1

    const subject = await prisma.subject.create({
      data: {
        name: body.name,
        weightage: body.weightage,
        foundationLevel: body.foundationLevel,
        position: highestPosition + 1,
        userId: user.id,
        expectedMarks: 0,
        overallProgress: 0,
        learningProgress: 0,
        revisionProgress: 0,
        practiceProgress: 0,
        testProgress: 0
      }
    })

    return NextResponse.json({
      message: "Subject created successfully",
      subject
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({
        error: "Validation error",
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.error('Error creating subject:', error)
    return new NextResponse(
      JSON.stringify({
        error: "Failed to create subject",
        message: error instanceof Error ? error.message : "An unexpected error occurred"
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const subjects = await prisma.subject.findMany({
      where: {
        user: {
          email: session.user.email
        }
      },
      orderBy: {
        position: 'asc'
      },
      include: {
        chapters: {
          include: {
            topics: true
          }
        }
      }
    })

    return NextResponse.json(subjects)
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 