import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { topicId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { type } = await request.json();

    // Validate type
    if (!["learning", "revision", "practice", "test"].includes(type)) {
      return new NextResponse("Invalid progress type", { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Get topic and related data
    const topic = await prisma.topic.findUnique({
      where: { id: params.topicId },
      include: {
        chapter: {
          include: {
            subject: true
          }
        }
      }
    });

    if (!topic) {
      return new NextResponse("Topic not found", { status: 404 });
    }

    // Create progress entry with subject ID
    const progress = await prisma.topicProgress.create({
      data: {
        type,
        completed: true,
        topic: { connect: { id: params.topicId } },
        user: { connect: { id: user.id } },
        subject: { connect: { id: topic.chapter.subject.id } }
      },
    });

    // Update the corresponding count based on type
    const updateData: any = {};
    switch (type) {
      case "learning":
        updateData.learningStatus = true;
        break;
      case "revision":
        updateData.revisionCount = Math.min(3, (topic.revisionCount || 0) + 1);
        updateData.lastRevised = new Date();
        // Set next revision date based on current revision count
        const daysToAdd = updateData.revisionCount === 1 ? 1 : 
                         updateData.revisionCount === 2 ? 3 : 7;
        updateData.nextRevision = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);
        break;
      case "practice":
        updateData.practiceCount = Math.min(3, (topic.practiceCount || 0) + 1);
        break;
      case "test":
        updateData.testCount = Math.min(3, (topic.testCount || 0) + 1);
        break;
    }

    // Update topic
    await prisma.topic.update({
      where: { id: params.topicId },
      data: updateData,
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("[TOPIC_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 