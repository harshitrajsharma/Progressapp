import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  weightage: z.number().min(0).max(100),
  foundationLevel: z.enum(["Beginner", "Moderate", "Advanced"]),
})

// Helper function to check subject ownership
async function checkSubjectOwnership(subjectId: string, userId: string) {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  })
  
  if (!subject) {
    throw new Error("Subject not found")
  }
  
  if (subject.userId !== userId) {
    throw new Error("Unauthorized")
  }
  
  return subject
}

export async function PATCH(
  req: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { name, weightage } = body

    if (!name || typeof weightage !== 'number') {
      return new NextResponse("Invalid input", { status: 400 })
    }

    // Verify subject belongs to user
    const subject = await prisma.subject.findUnique({
      where: {
        id: params.subjectId,
      },
      include: {
        chapters: {
          include: {
            topics: true,
          },
        },
      },
    })

    if (!subject) {
      return new NextResponse("Subject not found", { status: 404 })
    }

    if (subject.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Update subject
    const updatedSubject = await prisma.subject.update({
      where: {
        id: params.subjectId,
      },
      data: {
        name,
        weightage,
      },
      include: {
        chapters: {
          include: {
            topics: true,
          },
        },
      },
    })

    return NextResponse.json(updatedSubject)
  } catch (error) {
    console.error("[SUBJECT_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check ownership
    await checkSubjectOwnership(params.subjectId, session.user.id)

    await prisma.subject.delete({
      where: {
        id: params.subjectId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Subject not found") {
        return new NextResponse("Subject not found", { status: 404 })
      }
      if (error.message === "Unauthorized") {
        return new NextResponse("Unauthorized", { status: 403 })
      }
    }

    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check ownership
    await checkSubjectOwnership(params.subjectId, session.user.id)

    const subject = await prisma.subject.findUnique({
      where: {
        id: params.subjectId,
      },
      include: {
        chapters: {
          include: {
            topics: true,
          },
        },
      },
    })

    return NextResponse.json(subject)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Subject not found") {
        return new NextResponse("Subject not found", { status: 404 })
      }
      if (error.message === "Unauthorized") {
        return new NextResponse("Unauthorized", { status: 403 })
      }
    }

    return new NextResponse("Internal Error", { status: 500 })
  }
} 