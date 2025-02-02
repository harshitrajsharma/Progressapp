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
        name: data.name,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 