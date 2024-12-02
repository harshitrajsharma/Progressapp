import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function DELETE(
  req: Request,
  { params }: { params: { testId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Verify test exists and user has access
    const test = await prisma.test.findFirst({
      where: {
        id: params.testId,
        subject: {
          userId: session.user.id,
        },
      },
      include: {
        subject: true,
      },
    })

    if (!test) {
      return new NextResponse("Test not found", { status: 404 })
    }

    // Delete the test
    await prisma.test.delete({
      where: {
        id: params.testId,
      },
    })

    // Update subject's expected marks
    const remainingTests = await prisma.test.findMany({
      where: {
        subjectId: test.subjectId,
      },
    })

    const averageScore = remainingTests.length > 0
      ? remainingTests.reduce((acc, test) => acc + test.score, 0) / remainingTests.length
      : 0

    const expectedMarks = (test.subject.weightage * averageScore) / 100

    await prisma.subject.update({
      where: {
        id: test.subjectId,
      },
      data: {
        expectedMarks,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[TEST_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 