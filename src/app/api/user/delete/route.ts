import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user first to ensure they exist
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user data in a transaction with increased timeout
    await prisma.$transaction(async (tx) => {
      // First batch: Delete all related data that doesn't have dependencies
      await Promise.all([
        tx.topicProgress.deleteMany({ where: { userId: user.id } }),
        tx.focusSession.deleteMany({ where: { userId: user.id } }),
        tx.testProgress.deleteMany({ where: { userId: user.id } }),
        tx.gateTest.deleteMany({ where: { userId: user.id } }),
        tx.studyProgress.deleteMany({ where: { userId: user.id } }),
        tx.dailyActivity.deleteMany({ where: { userId: user.id } }),
        tx.studyGoal.deleteMany({ where: { userId: user.id } }),
        tx.performanceMetrics.deleteMany({ where: { userId: user.id } }),
        tx.dailySchedule.deleteMany({ where: { userId: user.id } }),
        tx.studyPhase.deleteMany({ where: { userId: user.id } }),
      ]);

      // Second batch: Delete items with simple relationships
      await Promise.all([
        tx.studyStreak.deleteMany({ where: { userId: user.id } }),
        tx.dashboard.deleteMany({ where: { userId: user.id } }),
        user.email ? tx.userSettings.deleteMany({ where: { userEmail: user.email } }) : Promise.resolve(),
      ]);

      // Third batch: Delete subjects (which will cascade to chapters and topics)
      await tx.subject.deleteMany({ where: { userId: user.id } });

      // Fourth batch: Delete auth-related data
      await Promise.all([
        tx.session.deleteMany({ where: { userId: user.id } }),
        tx.account.deleteMany({ where: { userId: user.id } }),
      ]);

      // Finally, delete the user
      await tx.user.delete({ where: { id: user.id } });
    }, {
      timeout: 10000, // Increase timeout to 10 seconds
      maxWait: 15000, // Maximum time to wait for transaction to start
    } as Prisma.TransactionOptions);

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    
    // Provide more specific error messages
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2028') {
        return NextResponse.json(
          { error: 'Operation timed out. Please try again.' },
          { status: 408 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 