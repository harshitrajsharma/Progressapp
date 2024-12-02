import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Validation schema for test creation
const testSchema = z.object({
  name: z.string().min(1, "Test name is required"),
  totalMarks: z.number().min(0, "Total marks must be positive"),
  marksScored: z.number().min(0, "Marks scored must be positive"),
  score: z.number().min(0).max(100),
  subjectId: z.string().min(1, "Subject ID is required"),
}).refine((data) => data.marksScored <= data.totalMarks, {
  message: "Marks scored cannot be greater than total marks",
  path: ["marksScored"],
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = testSchema.parse(json)

    // Verify subject exists and user has access
    const subject = await prisma.subject.findFirst({
      where: {
        id: body.subjectId,
        userId: session.user.id,
      },
    })

    if (!subject) {
      return new NextResponse("Subject not found", { status: 404 })
    }

    // Create the test
    const test = await prisma.test.create({
      data: body,
    })

    // Update subject's expected marks based on test performance
    const tests = await prisma.test.findMany({
      where: {
        subjectId: body.subjectId,
      },
    })

    const averageScore = tests.reduce((acc, test) => acc + test.score, 0) / tests.length
    const expectedMarks = (subject.weightage * averageScore) / 100

    await prisma.subject.update({
      where: {
        id: body.subjectId,
      },
      data: {
        expectedMarks,
        testProgress: Math.min(averageScore, 100), // Update test progress
      },
    })

    return NextResponse.json(test)
  } catch (error) {
    console.error("[TEST_CREATE]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }

    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const subjectId = searchParams.get("subjectId")

    if (!subjectId) {
      return new NextResponse("Subject ID is required", { status: 400 })
    }

    // Verify subject exists and user has access
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        userId: session.user.id,
      },
    })

    if (!subject) {
      return new NextResponse("Subject not found", { status: 404 })
    }

    const tests = await prisma.test.findMany({
      where: {
        subjectId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(tests)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
} 