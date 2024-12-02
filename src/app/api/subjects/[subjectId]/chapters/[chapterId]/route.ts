import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function DELETE(
  req: Request,
  { params }: { params: { subjectId: string; chapterId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

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

    // Verify chapter exists and belongs to the subject
    const chapter = await prisma.chapter.findFirst({
      where: {
        id: params.chapterId,
        subjectId: params.subjectId,
      },
    })

    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 })
    }

    // Delete chapter and all related topics (Prisma will handle cascading delete)
    await prisma.chapter.delete({
      where: {
        id: params.chapterId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting chapter:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 