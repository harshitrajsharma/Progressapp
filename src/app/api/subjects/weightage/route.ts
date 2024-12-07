import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const subjects = await prisma.subject.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        name: true,
        weightage: true,
        overallProgress: true,
      },
      orderBy: {
        position: 'asc'
      }
    })

    return NextResponse.json(subjects)
  } catch (error) {
    console.error("[SUBJECTS_WEIGHTAGE_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 