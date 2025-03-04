import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ChapterCategory } from "@/types/prisma/category";

type TopicUpdateData = {
  learningStatus?: boolean;
  revisionCount?: number;
  practiceCount?: number;
  testCount?: number;
  lastRevised?: Date;
  nextRevision?: Date;
};

interface Topic {
  id: string;
  name: string;
  learningStatus: boolean;
  revisionCount: number;
  practiceCount: number;
  testCount: number;
  chapterId: string;
  lastRevised: Date | null;
  nextRevision: Date | null;
}

function getCountForCategory(topic: Topic, category: ChapterCategory): number {
  switch (category) {
    case 'revision':
      return topic.revisionCount;
    case 'practice':
      return topic.practiceCount;
    case 'test':
      return topic.testCount;
    default:
      return 0;
  }
}

export async function POST(
  req: Request,
  { params }: { params: { topicId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { type, currentValue, newValue, updateProgress } = await req.json();

    // Validate the topic exists and belongs to the user
    const topic = await prisma.topic.findFirst({
      where: {
        id: params.topicId,
        chapter: {
          subject: {
            userId: session.user.id
          }
        }
      },
      include: {
        chapter: {
          select: {
            id: true,
            name: true,
            subjectId: true,
            subject: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!topic) {
      return new NextResponse("Topic not found", { status: 404 });
    }

    // Check if topic is learned before allowing progress in other categories
    if (type !== 'learning' && !topic.learningStatus) {
      return NextResponse.json({
        success: false,
        error: "TOPIC_NOT_LEARNED",
        message: "You need to learn this topic first before marking progress in other categories.",
        names: {
          topicName: topic.name,
          chapterName: topic.chapter.name
        }
      }, { status: 400 });
    }

    // Update topic based on category
    const updateData: TopicUpdateData = {};
    if (type === 'learning') {
      updateData.learningStatus = !topic.learningStatus;
    } else {
      switch (type) {
        case 'revision':
          updateData.revisionCount = newValue;
          break;
        case 'practice':
          updateData.practiceCount = newValue;
          break;
        case 'test':
          updateData.testCount = newValue;
          break;
      }
    }

    // Update last revised and next revision if it's a revision
    if (type === 'revision' && newValue > currentValue) {
      const now = new Date();
      updateData.lastRevised = now;
      
      // Calculate next revision date based on spaced repetition
      const nextRevision = new Date(now);
      nextRevision.setDate(now.getDate() + (newValue * 2)); // Simple spaced repetition formula
      updateData.nextRevision = nextRevision;
    }

    // Update the topic
    const updatedTopic = await prisma.topic.update({
      where: { id: params.topicId },
      data: updateData,
      include: {
        chapter: {
          select: {
            name: true,
            subject: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Update completion status
    const completionStatus = {
      isCompleted: false,
      isTopicCategoryCompleted: false,
      isChapterCompleted: false,
      isSubjectCompleted: false,
      names: {
        topicName: updatedTopic.name,
        chapterName: updatedTopic.chapter.name,
        subjectName: updatedTopic.chapter.subject.name
      }
    };

    // Update progress if requested
    if (updateProgress) {
      // Calculate new progress values
      const chapterTopics = await prisma.topic.findMany({
        where: { chapterId: topic.chapterId }
      });

      const progress = calculateProgress(chapterTopics, type as ChapterCategory);

      // Check if topic is completed for this category
      completionStatus.isCompleted = type === 'learning' 
        ? updatedTopic.learningStatus 
        : getCountForCategory(updatedTopic, type as ChapterCategory) === newValue;

      // Check if topic category is fully completed (all 3 boxes checked)
      completionStatus.isTopicCategoryCompleted = type !== 'learning' && newValue === 3;

      // Check if chapter is completed for this category
      completionStatus.isChapterCompleted = progress === 100;

      // Update chapter progress
      await prisma.chapter.update({
        where: { id: topic.chapterId },
        data: {
          [`${type}Progress`]: progress
        }
      });

      // Update subject progress
      const subjectChapters = await prisma.chapter.findMany({
        where: { subjectId: topic.chapter.subjectId },
        include: { topics: true }
      });

      const subjectProgress = subjectChapters.reduce((acc, chapter) => {
        return acc + calculateProgress(chapter.topics, type as ChapterCategory);
      }, 0) / subjectChapters.length;

      // Check if subject is completed for this category
      completionStatus.isSubjectCompleted = subjectProgress === 100;

      await prisma.subject.update({
        where: { id: topic.chapter.subjectId },
        data: {
          [`${type}Progress`]: subjectProgress
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      topic: updatedTopic,
      completionStatus
    });
  } catch (error) {
    console.error('Error updating topic status:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function calculateProgress(topics: Topic[], category: ChapterCategory): number {
  const total = topics.length;
  if (total === 0) return 0;

  let completed = 0;
  if (category === 'learning') {
    completed = topics.filter(t => t.learningStatus).length;
  } else {
    completed = topics.filter(t => getCountForCategory(t, category) === 3).length;
  }

  return Math.round((completed / total) * 100);
} 