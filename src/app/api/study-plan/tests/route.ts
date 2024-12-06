import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TestScheduler } from '@/lib/services/test-scheduler';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's test schedule
    const tests = await prisma.gateTest.findMany({
      where: {
        userId: session.user.id,
        completed: false
      },
      orderBy: {
        scheduledFor: 'asc'
      }
    });

    return NextResponse.json(tests);
  } catch (error) {
    console.error('Error fetching test schedule:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user data with subjects and progress
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subjects: {
          include: {
            chapters: true
          }
        },
        studyProgress: true
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Calculate days until exam
    const daysToExam = Math.ceil(
      (user.examDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    // Generate test schedule
    const testScheduler = new TestScheduler(
      user.subjects,
      user.studyProgress,
      daysToExam
    );

    const schedule = testScheduler.generateTestSchedule();

    // Save tests to database
    await prisma.gateTest.createMany({
      data: schedule.map(test => ({
        ...test,
        userId: user.id
      })),
      skipDuplicates: true
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error generating test schedule:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { testId, completed, score } = body;

    // Update test status
    const updatedTest = await prisma.gateTest.update({
      where: {
        id: testId,
        userId: session.user.id
      },
      data: {
        completed,
        score,
        completedAt: completed ? new Date() : null
      }
    });

    // Update test progress
    if (completed) {
      await prisma.testProgress.updateMany({
        where: {
          userId: session.user.id,
          subjectId: {
            in: updatedTest.subjects
          }
        },
        data: {
          [`${updatedTest.type.toLowerCase()}Completed`]: {
            increment: 1
          },
          [`last${updatedTest.type}`]: new Date()
        }
      });
    }

    return NextResponse.json(updatedTest);
  } catch (error) {
    console.error('Error updating test:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 