import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { checkSubjectOwnership } from "@/lib/api-utils"

export async function PATCH(
  req: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { name, weightage } = body

    if (!name || typeof weightage !== 'number' || weightage < 0 || weightage > 100) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid input" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    await checkSubjectOwnership(params.subjectId, session.user.id)

    const updatedSubject = await prisma.subject.update({
      where: {
        id: params.subjectId,
      },
      data: {
        name,
        weightage,
      },
    })

    return NextResponse.json({
      message: "Subject updated successfully",
      subject: updatedSubject
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Subject not found") {
        return new NextResponse(
          JSON.stringify({ message: "Subject not found" }), 
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        )
      }
      if (error.message === "Unauthorized") {
        return new NextResponse(
          JSON.stringify({ message: "Unauthorized" }), 
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    console.error('Error updating subject:', error)
    return new NextResponse(
      JSON.stringify({ message: "Internal Error" }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await checkSubjectOwnership(params.subjectId, session.user.id)

    await prisma.subject.delete({
      where: {
        id: params.subjectId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Subject not found") {
        return new NextResponse("Subject not found", { status: 404 })
      }
      if (error.message === "Unauthorized") {
        return new NextResponse("Unauthorized", { status: 403 })
      }
    }

    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { subjectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await checkSubjectOwnership(params.subjectId, session.user.id)

    const subject = await prisma.subject.findUnique({
      where: {
        id: params.subjectId,
      },
      include: {
        chapters: {
          include: {
            topics: true,
          },
        },
      },
    })

    return NextResponse.json(subject)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Subject not found") {
        return new NextResponse("Subject not found", { status: 404 })
      }
      if (error.message === "Unauthorized") {
        return new NextResponse("Unauthorized", { status: 403 })
      }
    }

    return new NextResponse("Internal Error", { status: 500 })
  }
} 