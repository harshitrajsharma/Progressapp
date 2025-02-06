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

    // Fetch user data with related information
    const userData = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subjects: {
          include: {
            chapters: {
              include: {
                topics: {
                  include: {
                    topicProgress: true
                  }
                }
              }
            },
            mockTests: true,
          }
        },
        studyStreak: true,
        dailyActivities: {
          orderBy: {
            date: 'desc'
          },
          take: 90 // Last 90 days of activity
        },
        studyGoals: true,
        performanceMetrics: true,
        focusSessions: {
          orderBy: {
            startTime: 'desc'
          },
          take: 100 // Last 100 sessions
        },
        settings: {
          select: {
            emailNotifications: true,
            progressReminders: true,
            testReminders: true
          }
        }
      }
    });

    if (!userData) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Remove sensitive information and format the data
    const { 
      password,
      emailVerified,
      ...safeUserData 
    } = userData;

    const exportData = {
      user: {
        name: safeUserData.name,
        email: safeUserData.email,
        examName: safeUserData.examName,
        examDate: safeUserData.examDate,
        createdAt: safeUserData.createdAt,
        settings: safeUserData.settings
      },
      subjects: safeUserData.subjects,
      progress: {
        studyStreak: safeUserData.studyStreak,
        dailyActivities: safeUserData.dailyActivities,
        studyGoals: safeUserData.studyGoals,
        performanceMetrics: safeUserData.performanceMetrics,
        focusSessions: safeUserData.focusSessions
      },
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    // Set headers for file download
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename=progress-data-${new Date().toISOString().split('T')[0]}.json`
      }
    });
  } catch (error) {
    console.error('[EXPORT_DATA_ERROR]:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to export data. Please try again.' }), 
      { status: 500 }
    );
  }
} 