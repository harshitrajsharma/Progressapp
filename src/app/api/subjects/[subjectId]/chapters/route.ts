import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import * as z from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

const createChapterSchema = z.object({
  name: z.string().min(1).max(50),
  important: z.boolean().default(false),
})

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
    const body = createChapterSchema.parse(json)

    // Verify subject ownership
    const subject = await prisma.subject.findFirst({
      where: {
        id: params.subjectId,
        userId: session.user.id!,
      },
    })

    if (!subject) {
      return new NextResponse("Subject not found", { status: 404 })
    }

    const chapter = await prisma.chapter.create({
      data: {
        name: body.name,
        important: body.important,
        overallProgress: 0,
        learningProgress: 0,
        revisionProgress: 0,
        practiceProgress: 0,
        testProgress: 0,
        subjectId: params.subjectId,
      },
    })

    return NextResponse.json(chapter)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }

    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 