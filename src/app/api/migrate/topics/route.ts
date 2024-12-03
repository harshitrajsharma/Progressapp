import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get all chapters for the user
    const chapters = await prisma.chapter.findMany({
      where: {
        subject: {
          userId: session.user.id!
        }
      },
      include: {
        topics: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    // Update topics in each chapter
    for (const chapter of chapters) {
      // Update each topic's position based on its index in the sorted array
      const updates = chapter.topics.map((topic, index) =>
        prisma.topic.update({
          where: { id: topic.id },
          data: { position: index }
        })
      )

      // Execute all updates in parallel
      await Promise.all(updates)
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated positions for topics in ${chapters.length} chapters` 
    })
  } catch (error) {
    console.error("[MIGRATE_TOPICS]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 