import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function POST(
  req: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const { name, important } = json

    // Validate input
    if (!name || typeof name !== "string") {
      return new NextResponse("Invalid name", { status: 400 })
    }

    // Check if subject exists and belongs to user
    const subject = await prisma.subject.findFirst({
      where: {
        id: params.subjectId,
        user: {
          email: session.user.email
        }
      }
    })

    if (!subject) {
      return new NextResponse("Subject not found", { status: 404 })
    }

    // Create chapter with complete structure
    const chapter = await prisma.chapter.create({
      data: {
        name,
        important: important || false,
        subjectId: params.subjectId,
        overallProgress: 0,
        learningProgress: 0,
        revisionProgress: 0,
        practiceProgress: 0,
        testProgress: 0,
      },
      include: {
        topics: true,
        subject: {
          include: {
            chapters: {
              include: {
                topics: true
              }
            }
          }
        }
      }
    })

    // Prepare the response with the correct structure
    const chapterResponse = {
      ...chapter,
      topics: chapter.topics || [], // Ensure topics is always an array
      subject: {
        ...chapter.subject,
        chapters: chapter.subject.chapters.map(ch => ({
          ...ch,
          topics: ch.topics || [] // Ensure each chapter has topics array
        }))
      }
    }

    return NextResponse.json(chapterResponse)
  } catch (error) {
    console.error("[CHAPTERS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 