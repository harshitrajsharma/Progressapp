import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const activities = await prisma.dailyActivity.findMany({
      where: {
        user: {
          email: session.user.email
        },
        date: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) // Last month's activities
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("[DAILY_ACTIVITIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 