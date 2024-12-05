import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import * as z from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

const reorderTopicSchema = z.object({
  topicId: z.string(),
  newPosition: z.number().int().min(0),
  positions: z.array(z.object({
    id: z.string(),
    position: z.number().int().min(0)
  }))
})

export async function PUT(
  req: Request,
  { params }: { params: { chapterId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = reorderTopicSchema.parse(json)

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

    // Update all topic positions in a single transaction
    await prisma.$transaction(
      body.positions.map(({ id, position }) =>
        prisma.topic.update({
          where: { id },
          data: { position }
        })
      )
    );

    // Return the updated topics list
    const updatedTopics = await prisma.topic.findMany({
      where: { chapterId: params.chapterId },
      orderBy: { position: 'asc' }
    })

    return NextResponse.json(updatedTopics)
  } catch (error) {
    console.error("[REORDER_ERROR]:", error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 })
    }

    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 