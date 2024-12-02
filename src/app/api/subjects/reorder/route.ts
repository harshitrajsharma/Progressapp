import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { subjects } = body

    console.log('Received reorder request:', subjects)

    // Validate input
    if (!Array.isArray(subjects)) {
      console.error('Invalid input: subjects is not an array')
      return new NextResponse(
        JSON.stringify({ error: 'Subjects array is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate each subject has required fields
    for (const subject of subjects) {
      if (!subject.id || typeof subject.position !== 'number') {
        console.error('Invalid subject data:', subject)
        return new NextResponse(
          JSON.stringify({ error: 'Each subject must have id and position' }), 
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // Get current subjects to verify they exist and belong to the user
    const currentSubjects = await prisma.subject.findMany({
      where: {
        id: { in: subjects.map(s => s.id) },
        userId: session.user.id
      },
      select: { id: true }
    })

    if (currentSubjects.length !== subjects.length) {
      console.error('Some subjects not found or do not belong to user')
      return new NextResponse(
        JSON.stringify({ error: 'Invalid subject IDs' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('Updating positions for subjects:', subjects)

    // Update positions one by one instead of transaction
    for (const subject of subjects) {
      await prisma.subject.update({
        where: { id: subject.id },
        data: { position: subject.position }
      })
    }

    console.log('Successfully updated subject positions')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering subjects:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 