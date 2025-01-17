import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { withRetry } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    const user = await withRetry(async () => {
      return await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          examDate: true,
          dailyActivities: {
            orderBy: {
              date: 'desc'
            },
            take: 30 // Last 30 days
          }
        }
      });
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "User not found" }),
        { status: 404 }
      );
    }

    return new NextResponse(
      JSON.stringify({ user }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in dashboard API route:', error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
} 