import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import * as z from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

const createTopicSchema = z.object({
  name: z.string().min(1).max(100),
  important: z.boolean().optional().default(false),
})

export async function POST(
  req: Request,
  { params }: { params: { chapterId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = createTopicSchema.parse(json)

    // Verify chapter exists and user has access
    const chapter = await prisma.chapter.findFirst({
      where: {
        id: params.chapterId,
        subject: {
          userId: session.user.id!,
        },
      },
      include: {
        topics: {
          orderBy: {
            position: 'asc'
          }
        }
      }
    })

    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 })
    }

    // Get the highest position to set the new topic at the end
    const maxPosition = chapter.topics.length > 0
      ? Math.max(...chapter.topics.map(t => t.position))
      : -1

    const topic = await prisma.topic.create({
      data: {
        name: body.name,
        important: body.important,
        chapterId: params.chapterId,
        position: maxPosition + 1 // Set position to one more than the highest existing position
      },
    })

    return NextResponse.json(topic)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }

    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 