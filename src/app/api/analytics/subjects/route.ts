import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get time range from query params
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'day'; // day, week, month, all
    const dateParam = searchParams.get('date') || new Date().toISOString();
    const date = new Date(dateParam);

    // Calculate date range based on selected range
    let startDate: Date, endDate: Date;
    switch (range) {
      case 'day':
        startDate = startOfDay(date);
        endDate = endOfDay(date);
        break;
      case 'week':
        startDate = startOfWeek(date, { weekStartsOn: 0 }); // 0 = Sunday
        endDate = endOfWeek(date, { weekStartsOn: 0 });
        break;
      case 'month':
        startDate = startOfMonth(date);
        endDate = endOfMonth(date);
        break;
      case 'all':
        // For "all", use all data since account creation or last 365 days
        startDate = subDays(new Date(), 365);
        endDate = new Date();
        break;
      default:
        startDate = startOfDay(date);
        endDate = endOfDay(date);
    }

    // Get subject progress data
    const subjectProgress = await prisma.topicProgress.groupBy({
      by: ['subjectId', 'type'],
      where: {
        userId: session.user.id,
        completed: true,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    });

    // Get subject details
    const subjects = await prisma.subject.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        weightage: true,
        overallProgress: true,
        learningProgress: true,
        revisionProgress: true,
        practiceProgress: true,
        testProgress: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Calculate subject activity
    const subjectActivity = subjects.map(subject => {
      // Get completed activities for this subject
      const activities = subjectProgress.filter(sp => sp.subjectId === subject.id);
      
      // Sum activities by type
      const learning = activities.find(a => a.type === 'learning')?._count || 0;
      const revision = activities.find(a => a.type === 'revision')?._count || 0;
      const practice = activities.find(a => a.type === 'practice')?._count || 0;
      const test = activities.find(a => a.type === 'test')?._count || 0;
      
      // Calculate total activities for this subject in the period
      const totalActivities = learning + revision + practice + test;
      
      return {
        ...subject,
        activity: {
          learning,
          revision,
          practice,
          test,
          total: totalActivities
        }
      };
    });

    // Sort by activity (most active first)
    const sortedSubjects = subjectActivity.sort((a, b) => b.activity.total - a.activity.total);

    // Get total activity stats
    const totalStats = {
      learning: sortedSubjects.reduce((sum, subject) => sum + subject.activity.learning, 0),
      revision: sortedSubjects.reduce((sum, subject) => sum + subject.activity.revision, 0),
      practice: sortedSubjects.reduce((sum, subject) => sum + subject.activity.practice, 0),
      test: sortedSubjects.reduce((sum, subject) => sum + subject.activity.test, 0),
      total: sortedSubjects.reduce((sum, subject) => sum + subject.activity.total, 0),
    };

    // Add activity percentage to each subject
    const subjectsWithPercentage = sortedSubjects.map(subject => ({
      ...subject,
      activityPercentage: totalStats.total > 0
        ? Math.round((subject.activity.total / totalStats.total) * 100)
        : 0
    }));

    return NextResponse.json({
      subjects: subjectsWithPercentage,
      totalStats,
      dateRange: {
        start: startDate,
        end: endDate,
        range,
      }
    });
  } catch (error) {
    console.error("[SUBJECT_PROGRESS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 