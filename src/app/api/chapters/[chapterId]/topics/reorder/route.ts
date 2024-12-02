import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import * as z from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

const reorderTopicSchema = z.object({
  topicId: z.string(),
  newIndex: z.number().int().min(0),
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

    // Find the topic to move
    const topicToMove = chapter.topics.find(t => t.id === body.topicId)
    if (!topicToMove) {
      return new NextResponse("Topic not found", { status: 404 })
    }

    const oldPosition = topicToMove.position
    const newPosition = body.newIndex

    // Update positions in database
    if (oldPosition !== newPosition) {
      if (oldPosition < newPosition) {
        // Moving down: Decrement positions of topics between old and new position
        await prisma.$transaction([
          prisma.topic.updateMany({
            where: {
              chapterId: params.chapterId,
              position: {
                gt: oldPosition,
                lte: newPosition
              }
            },
            data: {
              position: {
                decrement: 1
              }
            }
          }),
          prisma.topic.update({
            where: { id: body.topicId },
            data: { position: newPosition }
          })
        ])
      } else {
        // Moving up: Increment positions of topics between new and old position
        await prisma.$transaction([
          prisma.topic.updateMany({
            where: {
              chapterId: params.chapterId,
              position: {
                gte: newPosition,
                lt: oldPosition
              }
            },
            data: {
              position: {
                increment: 1
              }
            }
          }),
          prisma.topic.update({
            where: { id: body.topicId },
            data: { position: newPosition }
          })
        ])
      }
    }

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