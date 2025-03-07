import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await req.json();
    
    // Validate exam date
    const examDate = data.examDate ? new Date(data.examDate) : null;
    if (examDate && isNaN(examDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid exam date format" },
        { status: 400 }
      );
    }

    // Validate numeric fields
    const targetScore = data.targetScore ? parseInt(data.targetScore) : null;
    const totalMarks = data.totalMarks ? parseInt(data.totalMarks) : null;
    const targetMarks = data.targetMarks ? parseInt(data.targetMarks) : null;

    if (targetScore && (targetScore < 0 || targetScore > 100)) {
      return NextResponse.json(
        { error: "Target score must be between 0 and 100" },
        { status: 400 }
      );
    }

    if (totalMarks && totalMarks <= 0) {
      return NextResponse.json(
        { error: "Total marks must be greater than 0" },
        { status: 400 }
      );
    }

    if (targetMarks && targetMarks <= 0) {
      return NextResponse.json(
        { error: "Target marks must be greater than 0" },
        { status: 400 }
      );
    }

    // Update user with exam details
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        examName: data.examName,
        examDate,
        targetScore,
        totalMarks,
        targetMarks,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        examName: true,
        examDate: true,
        targetScore: true,
        totalMarks: true,
        targetMarks: true,
        createdAt: true,
        emailVerified: true,
      }
    });

    // Return updated user data for session update
    return NextResponse.json({
      ...user,
      needsOnboarding: !user.examDate
    });
  } catch (error) {
    console.error('Error updating exam details:', error);
    return NextResponse.json(
      { error: "Failed to update exam details" },
      { status: 500 }
    );
  }
} 