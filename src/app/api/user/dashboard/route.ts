import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { withRetry } from "@/lib/db";
import { startOfMonth, endOfMonth } from "date-fns";

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
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      return await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          examDate: true,
          dailyActivities: {
            where: {
              date: {
                gte: monthStart,
                lte: monthEnd
              }
            },
            orderBy: {
              date: 'asc'
            }
          },
          subjects: {
            include: {
              tests: true,
              mockTests: true,
              chapters: {
                include: {
                  topics: true,
                  subject: true
                }
              }
            }
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