import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if tests should be included
    const { searchParams } = new URL(request.url)
    const includeTests = searchParams.get('include') === 'tests'

    // Get subjects with chapters and topics
    const subjects = await prisma.subject.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        position: 'asc'
      },
      include: {
        chapters: {
          include: {
            topics: true
          }
        },
        ...(includeTests && { tests: true })
      }
    })

    return NextResponse.json(subjects)
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { name, weightage, foundationLevel } = body

    // Validate required fields
    if (!name || !weightage || !foundationLevel) {
      return new NextResponse(
        JSON.stringify({ error: 'Name, weightage, and foundation level are required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create new subject with all required fields
    const subject = await prisma.subject.create({
      data: {
        name,
        weightage: Number(weightage),
        foundationLevel,
        expectedMarks: 0, // Initialize to 0
        overallProgress: 0,
        learningProgress: 0,
        revisionProgress: 0,
        practiceProgress: 0,
        testProgress: 0,
        userId: session.user.id,
      },
      include: {
        chapters: true,
      },
    })

    return NextResponse.json(subject)
  } catch (error) {
    console.error('Error creating subject:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 