import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get all subjects with their chapters for the current user
    const subjects = await prisma.subject.findMany({
      where: {
        userId: session.user.id!,
      },
      include: {
        chapters: true,
      },
    })

    return NextResponse.json(subjects)
  } catch (error) {
    console.error("Test endpoint error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 