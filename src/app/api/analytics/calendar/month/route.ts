import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
      return new NextResponse("Missing date range", { status: 400 });
    }

    // Fetch all activities within the date range
    const activities = await prisma.topicProgress.findMany({
      where: {
        userId: session.user.id,
        completed: true,
        date: {
          gte: startOfDay(new Date(start)),
          lte: endOfDay(new Date(end)),
        },
      },
      include: {
        topic: {
          include: {
            chapter: {
              include: {
                subject: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Group activities by date
    const activitiesByDate = activities.reduce((acc, activity) => {
      const dateStr = activity.date.toISOString().split('T')[0];
      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          learning: 0,
          revision: 0,
          practice: 0,
          test: 0,
          totalCount: 0,
          details: {
            learning: [],
            revision: [],
            practice: [],
            test: [],
          }
        };
      }

      const type = activity.type;
      if (type in acc[dateStr]) {
        acc[dateStr][type]++;
        acc[dateStr].totalCount++;

        if (activity.topic?.chapter?.subject) {
          acc[dateStr].details[type].push({
            subject: activity.topic.chapter.subject.name,
            topic: activity.topic.name,
            completedAt: activity.date.toISOString(),
          });
        }
      }

      return acc;
    }, {} as Record<string, any>);

    // Convert to array and calculate goal progress
    const result = Object.values(activitiesByDate).map(day => ({
      ...day,
      goalProgress: Math.min((day.totalCount / 5) * 100, 100),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("[MONTH_ACTIVITIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 