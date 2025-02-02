import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete user data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete user settings
      await tx.userSettings.delete({
        where: {
          userEmail: session.user.email,
        },
      }).catch(() => {}); // Ignore if doesn't exist

      // Delete user exam details
      await tx.examDetails.delete({
        where: {
          userEmail: session.user.email,
        },
      }).catch(() => {}); // Ignore if doesn't exist

      // Delete user account
      await tx.user.delete({
        where: {
          email: session.user.email,
        },
      });
    });

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 