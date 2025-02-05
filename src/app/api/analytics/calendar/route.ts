import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay, subDays } from "date-fns";

type ActivityType = 'learning' | 'revision' | 'practice' | 'test';

interface ActivityDetail {
  subject: string;
  topic: string;
  completedAt: string;
}

interface ActivityCounts {
  learning: number;
  revision: number;
  practice: number;
  test: number;
  totalCount: number;
}

interface ActivityDetails {
  learning: ActivityDetail[];
  revision: ActivityDetail[];
  practice: ActivityDetail[];
  test: ActivityDetail[];
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the date from the URL
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    
    if (!dateStr) {
      return new NextResponse("Date parameter is required", { status: 400 });
    }

    const date = new Date(dateStr);
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Fetch topic progress for the specified date
    const topicProgress = await prisma.topicProgress.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
        completed: true,
      },
      include: {
        topic: {
          include: {
            chapter: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate current streak
    let currentStreak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dayProgress = await prisma.topicProgress.findFirst({
        where: {
          userId: user.id,
          date: {
            gte: startOfDay(currentDate),
            lte: endOfDay(currentDate),
          },
          completed: true,
        },
      });

      if (!dayProgress) break;
      currentStreak++;
      currentDate = subDays(currentDate, 1);
    }

    // Group activities by type
    const details = topicProgress.reduce<ActivityDetails>(
      (acc, progress) => {
        if (!progress.topic?.chapter?.subject) return acc;
        
        const activityDetail: ActivityDetail = {
          subject: progress.topic.chapter.subject.name,
          topic: progress.topic.name,
          completedAt: progress.date.toISOString(),
        };

        const type = progress.type as ActivityType;
        if (type in acc) {
          acc[type].push(activityDetail);
        }
        
        return acc;
      },
      {
        learning: [],
        revision: [],
        practice: [],
        test: [],
      }
    );

    // Count activities by type
    const counts = topicProgress.reduce<ActivityCounts>(
      (acc, progress) => {
        const type = progress.type as ActivityType;
        if (type in acc) {
          acc[type]++;
          acc.totalCount++;
        }
        return acc;
      },
      {
        learning: 0,
        revision: 0,
        practice: 0,
        test: 0,
        totalCount: 0,
      }
    );

    // Calculate goal progress (assuming 5 activities per day is 100%)
    const goalProgress = Math.min((counts.totalCount / 5) * 100, 100);

    return NextResponse.json({
      date: dateStr,
      ...counts,
      goalProgress,
      currentStreak,
      details,
    });
  } catch (error) {
    console.error("[CALENDAR_ANALYTICS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 