import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        examName: true,
        examDate: true,
        createdAt: true,
        settings: {
          select: {
            emailNotifications: true,
            progressReminders: true,
            testReminders: true,
          }
        },
        studyStreak: {
          select: {
            currentStreak: true,
            longestStreak: true,
            dailyGoals: true,
          }
        },
        focusSessions: {
          select: {
            totalDuration: true,
          }
        },
        dailyActivities: {
          select: {
            studyTime: true,
            topicsCount: true,
            testsCount: true,
          },
          orderBy: {
            date: 'desc'
          },
          take: 7
        }
      }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Calculate total study hours from focus sessions
    const totalStudyHours = user.focusSessions.reduce((acc, session) => 
      acc + session.totalDuration, 0) / 60;

    // Calculate average daily activity
    const avgDailyActivity = user.dailyActivities.reduce((acc, day) => ({
      studyTime: acc.studyTime + day.studyTime,
      topicsCount: acc.topicsCount + day.topicsCount,
      testsCount: acc.testsCount + day.testsCount,
    }), { studyTime: 0, topicsCount: 0, testsCount: 0 });

    const response = {
      ...user,
      stats: {
        totalStudyHours: Math.round(totalStudyHours),
        avgDailyStudyMinutes: Math.round(avgDailyActivity.studyTime / 7),
        avgDailyTopics: Math.round(avgDailyActivity.topicsCount / 7),
        avgDailyTests: Math.round(avgDailyActivity.testsCount / 7),
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user details:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 