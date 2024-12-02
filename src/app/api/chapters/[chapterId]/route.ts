import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { chapterId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { name, important } = body;

    if (typeof name !== 'string' && typeof important !== 'boolean') {
      return new NextResponse(
        JSON.stringify({ error: "Invalid input: must provide either 'name' (string) or 'important' (boolean)" }), 
        { status: 400 }
      );
    }

    // Verify chapter exists and user has access
    const existingChapter = await prisma.chapter.findFirst({
      where: {
        id: params.chapterId,
        subject: {
          userId: session.user.id,
        },
      },
    });

    if (!existingChapter) {
      return new NextResponse(
        JSON.stringify({ error: "Chapter not found or access denied" }), 
        { status: 404 }
      );
    }

    // Update chapter
    const updatedChapter = await prisma.chapter.update({
      where: { id: params.chapterId },
      data: {
        ...(typeof name === 'string' && { name }),
        ...(typeof important === 'boolean' && { important }),
      },
    });

    return NextResponse.json({
      success: true,
      chapter: updatedChapter,
    });

  } catch (error) {
    console.error("[CHAPTER_UPDATE]", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to update chapter",
        details: error instanceof Error ? error.message : "Unknown error"
      }), 
      { status: 500 }
    );
  }
} 