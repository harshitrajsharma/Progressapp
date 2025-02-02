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
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        examName: data.examName,
        examDate: data.examDate ? new Date(data.examDate) : null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating exam details:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 