import { Suspense } from 'react';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { withRetry } from "@/lib/db";
import Loading from "@/components/loading";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { redirect } from "next/navigation";
import { User, MockTest, DailyActivity, StudyStreak } from "@prisma/client";
import { SubjectWithRelations } from "@/lib/calculations/types";

interface DashboardUser extends User {
  name: string | null;
  mockTests: MockTest[];
  studyStreak: StudyStreak | null;
  subjects: SubjectWithRelations[];
  dailyActivities: DailyActivity[];
  examName: string;
  examDate: Date;
  targetMarks: number;
}

async function getDashboardData(email: string): Promise<DashboardUser | null> {
  return await withRetry(async () => {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
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
        },
        mockTests: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        studyStreak: true,
        dailyActivities: {
          orderBy: {
            date: 'desc'
          },
          take: 30 // Last 30 days
        }
      }
    }) as DashboardUser | null;
    return user;
  });
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  const user = await getDashboardData(session.user.email);

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <Suspense fallback={<Loading />}>
      <DashboardContent 
        user={{
          
          ...user,
          name: user.name || 'there',
          targetMarks: user.targetMarks || 0
        }} 
      />
    </Suspense>
  );
}