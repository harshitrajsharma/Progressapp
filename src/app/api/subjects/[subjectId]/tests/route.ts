import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Verify subject belongs to user
    const subject = await prisma.subject.findUnique({
      where: {
        id: params.subjectId,
        userId: session.user.id
      }
    })

    if (!subject) {
      return new NextResponse("Subject not found", { status: 404 })
    }

    // Get tests for the subject
    const tests = await prisma.test.findMany({
      where: {
        subjectId: params.subjectId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(tests)
  } catch (error) {
    console.error('Error fetching tests:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 