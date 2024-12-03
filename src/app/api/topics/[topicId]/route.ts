import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { topicId: string } }
) {
  try {
    console.log("[TOPIC_UPDATE] Starting update for topic:", params.topicId);
    
    // Get session
    const session = await getServerSession(authOptions);
    console.log("[TOPIC_UPDATE] Session:", session);
    
    if (!session?.user?.id) {
      console.log("[TOPIC_UPDATE] No session or user ID");
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    console.log("[TOPIC_UPDATE] Request body:", body);
    const { important, name, learningStatus, revisionCount, practiceCount, testCount } = body;

    // Validate at least one valid field is provided
    if (
      typeof important !== 'boolean' && 
      typeof name !== 'string' && 
      typeof learningStatus !== 'boolean' &&
      (typeof revisionCount !== 'number' || revisionCount < 0 || revisionCount > 3) &&
      (typeof practiceCount !== 'number' || practiceCount < 0 || practiceCount > 3) &&
      (typeof testCount !== 'number' || testCount < 0 || testCount > 3)
    ) {
      console.log("[TOPIC_UPDATE] Invalid input:", body);
      return new NextResponse(
        JSON.stringify({ 
          error: "Invalid input: must provide valid values for update" 
        }), 
        { status: 400 }
      );
    }

    // Verify topic exists and user has access
    const existingTopic = await prisma.topic.findFirst({
      where: {
        id: params.topicId,
        chapter: {
          subject: {
            userId: session.user.id,
          },
        },
      },
    });
    console.log("[TOPIC_UPDATE] Found existing topic:", existingTopic);

    if (!existingTopic) {
      console.log("[TOPIC_UPDATE] Topic not found or access denied");
      return new NextResponse(
        JSON.stringify({ error: "Topic not found or access denied" }), 
        { status: 404 }
      );
    }

    // Update topic
    console.log("[TOPIC_UPDATE] Updating topic with:", body);
    const updatedTopic = await prisma.topic.update({
      where: { 
        id: params.topicId,
      },
      data: {
        ...(typeof important === 'boolean' && { important }),
        ...(typeof name === 'string' && { name }),
        ...(typeof learningStatus === 'boolean' && { learningStatus }),
        ...(typeof revisionCount === 'number' && { revisionCount }),
        ...(typeof practiceCount === 'number' && { practiceCount }),
        ...(typeof testCount === 'number' && { testCount }),
      },
      // Include all fields in the response
      select: {
        id: true,
        name: true,
        important: true,
        learningStatus: true,
        revisionCount: true,
        practiceCount: true,
        testCount: true,
        chapterId: true,
        position: true,
        lastRevised: true,
        nextRevision: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // After updating the topic, recalculate chapter progress
    const chapter = await prisma.chapter.findUnique({
      where: { id: updatedTopic.chapterId },
      include: {
        topics: {
          select: {
            learningStatus: true,
            revisionCount: true,
            practiceCount: true,
            testCount: true
          }
        },
      },
    });

    if (chapter && chapter.topics.length > 0) {
      // Calculate learning progress
      const completedLearning = chapter.topics.filter(t => t.learningStatus).length;
      const learning = Math.round((completedLearning / chapter.topics.length) * 100);

      // For revision/practice/test - each topic has 3 checkboxes
      const maxChecksPerCategory = chapter.topics.length * 3;

      // Calculate revision progress
      const totalRevisionChecks = chapter.topics.reduce((acc, t) => acc + (t.revisionCount || 0), 0);
      const revision = maxChecksPerCategory > 0 
        ? Math.round((totalRevisionChecks / maxChecksPerCategory) * 100)
        : 0;

      // Calculate practice progress
      const totalPracticeChecks = chapter.topics.reduce((acc, t) => acc + (t.practiceCount || 0), 0);
      const practice = maxChecksPerCategory > 0 
        ? Math.round((totalPracticeChecks / maxChecksPerCategory) * 100)
        : 0;

      // Calculate test progress
      const totalTestChecks = chapter.topics.reduce((acc, t) => acc + (t.testCount || 0), 0);
      const test = maxChecksPerCategory > 0 
        ? Math.round((totalTestChecks / maxChecksPerCategory) * 100)
        : 0;

      // Update chapter progress
      await prisma.chapter.update({
        where: { id: updatedTopic.chapterId },
        data: {
          learningProgress: learning,
          revisionProgress: revision,
          practiceProgress: practice,
          testProgress: test,
          overallProgress: Math.round((learning + revision + practice + test) / 4),
        },
      });

      console.log("[TOPIC_UPDATE] Updated chapter progress:", {
        learning,
        revision,
        practice,
        test,
        overall: Math.round((learning + revision + practice + test) / 4)
      });
    }

    console.log("[TOPIC_UPDATE] Topic updated successfully:", updatedTopic);

    return NextResponse.json({
      success: true,
      topic: updatedTopic,
    });

  } catch (error) {
    console.error("[TOPIC_UPDATE] Error details:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to update topic",
        details: error instanceof Error ? error.message : "Unknown error"
      }), 
      { status: 500 }
    );
  }
} 

export async function DELETE(
  req: Request,
  { params }: { params: { topicId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { topicId } = params;

    // First verify that the topic belongs to a chapter that belongs to a subject owned by the user
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        chapter: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!topic) {
      return new NextResponse("Topic not found", { status: 404 });
    }

    if (topic.chapter.subject.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chapterId = topic.chapterId;

    // Delete the topic
    await prisma.topic.delete({
      where: { id: topicId },
    });

    // Recalculate chapter progress after topic deletion
    const updatedChapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        topics: true,
      },
    });

    if (updatedChapter) {
      const totalTopics = updatedChapter.topics.length;
      if (totalTopics > 0) {
        // Calculate learning progress
        const completedLearning = updatedChapter.topics.filter(t => t.learningStatus).length;
        const learning = Math.round((completedLearning / totalTopics) * 100);

        // For revision/practice/test - each topic has 3 checkboxes
        const maxChecksPerCategory = totalTopics * 3;

        // Calculate revision progress
        const totalRevisionChecks = updatedChapter.topics.reduce((acc, t) => acc + t.revisionCount, 0);
        const revision = Math.round((totalRevisionChecks / maxChecksPerCategory) * 100);

        // Calculate practice progress
        const totalPracticeChecks = updatedChapter.topics.reduce((acc, t) => acc + t.practiceCount, 0);
        const practice = Math.round((totalPracticeChecks / maxChecksPerCategory) * 100);

        // Calculate test progress
        const totalTestChecks = updatedChapter.topics.reduce((acc, t) => acc + t.testCount, 0);
        const test = Math.round((totalTestChecks / maxChecksPerCategory) * 100);

        // Overall progress
        const overall = Math.round((learning + revision + practice + test) / 4);

        await prisma.chapter.update({
          where: { id: chapterId },
          data: {
            learningProgress: learning,
            revisionProgress: revision,
            practiceProgress: practice,
            testProgress: test,
            overallProgress: overall,
          },
        });
      } else {
        // If no topics left, reset all progress
        await prisma.chapter.update({
          where: { id: chapterId },
          data: {
            learningProgress: 0,
            revisionProgress: 0,
            practiceProgress: 0,
            testProgress: 0,
            overallProgress: 0,
          },
        });
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TOPIC_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 