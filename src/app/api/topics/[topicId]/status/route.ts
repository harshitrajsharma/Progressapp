import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { topicId: string } }
) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { mode, count } = body;

    if (!mode || typeof count !== 'number') {
      return new NextResponse(
        JSON.stringify({ error: "Invalid input: mode and count are required" }), 
        { status: 400 }
      );
    }

    // Verify topic exists and user has access
    const topic = await prisma.topic.findFirst({
      where: {
        id: params.topicId,
        chapter: {
          subject: {
            userId: session.user.id,
          },
        },
      },
      include: {
        chapter: true,
      },
    });

    if (!topic) {
      return new NextResponse(
        JSON.stringify({ error: "Topic not found or access denied" }), 
        { status: 404 }
      );
    }

    // Update topic based on mode
    const updateData: {
      learningStatus?: boolean;
      revisionCount?: number;
      lastRevised?: Date | null;
      nextRevision?: Date;
      practiceCount?: number;
      testCount?: number;
    } = {};
    switch (mode) {
      case "learning":
        updateData.learningStatus = count > 0;
        break;
      case "revision":
        updateData.revisionCount = count;
        updateData.lastRevised = count > 0 ? new Date() : null;
        // Set next revision date if count increased
        if (count > topic.revisionCount) {
          updateData.nextRevision = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
        }
        break;
      case "practice":
        updateData.practiceCount = count;
        break;
      case "test":
        updateData.testCount = count;
        break;
      default:
        return new NextResponse(
          JSON.stringify({ error: "Invalid mode" }), 
          { status: 400 }
        );
    }

    // Update topic
    const updatedTopic = await prisma.topic.update({
      where: { id: params.topicId },
      data: updateData,
    });

    // Get all topics in the chapter to recalculate progress
    const chapterTopics = await prisma.topic.findMany({
      where: { chapterId: topic.chapterId },
    });

    const totalTopics = chapterTopics.length;
    
    // Calculate learning progress
    const completedLearning = chapterTopics.filter(t => t.learningStatus).length;
    const learning = Math.round((completedLearning / totalTopics) * 100);

    // For revision/practice/test - each topic has 3 checkboxes
    const maxChecksPerCategory = totalTopics * 3;

    // Calculate revision progress
    const totalRevisionChecks = chapterTopics.reduce((acc, t) => acc + t.revisionCount, 0);
    const revision = Math.round((totalRevisionChecks / maxChecksPerCategory) * 100);

    // Calculate practice progress
    const totalPracticeChecks = chapterTopics.reduce((acc, t) => acc + t.practiceCount, 0);
    const practice = Math.round((totalPracticeChecks / maxChecksPerCategory) * 100);

    // Calculate test progress
    const totalTestChecks = chapterTopics.reduce((acc, t) => acc + t.testCount, 0);
    const test = Math.round((totalTestChecks / maxChecksPerCategory) * 100);

    // Overall progress
    const overall = Math.round((learning + revision + practice + test) / 4);

    // Update chapter progress
    await prisma.chapter.update({
      where: { id: topic.chapterId },
      data: {
        learningProgress: learning,
        revisionProgress: revision,
        practiceProgress: practice,
        testProgress: test,
        overallProgress: overall,
      },
    });

    return NextResponse.json({
      success: true,
      topic: updatedTopic,
      chapterProgress: {
        learning,
        revision,
        practice,
        test,
        overall,
      },
    });

  } catch (error) {
    console.error("[TOPIC_STATUS_UPDATE]", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to update topic status",
        details: error instanceof Error ? error.message : "Unknown error"
      }), 
      { status: 500 }
    );
  }
} 