import { Suspense } from 'react'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { withRetry } from "@/lib/db"
import Loading from "@/components/loading"
import { StudyTimer } from "@/components/dashboard/study-timer"
import { DashboardProgressOverview } from "@/components/dashboard/progress-overview"
import { SubjectCount } from "@/components/recommendations/subject-count"
import { ExamCountdown } from "@/components/dashboard/exam-countdown"
import { redirect } from "next/navigation"
import { User, MockTest, DailyActivity, StudyStreak } from "@prisma/client"
import { SubjectWithRelations } from "@/lib/calculations/types"
import { calculateDashboardProgress } from "@/lib/calculations/dashboard-progress"

interface DashboardUser extends User {
  mockTests: MockTest[];
  studyStreak: StudyStreak | null;
  subjects: SubjectWithRelations[];
  dailyActivities: DailyActivity[];
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
      },
    }) as DashboardUser | null;
    return user;
  })
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect("/auth/signin")

  return (
    <Suspense fallback={<Loading />}>
      <DashboardContent userEmail={session.user.email} />
    </Suspense>
  )
}

async function DashboardContent({ userEmail }: { userEmail: string }) {
  const user = await getDashboardData(userEmail)
  if (!user?.examName || !user.examDate) redirect("/onboarding")

  const progress = calculateDashboardProgress(user.subjects)
  

  return (
    <div className="md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your {user.examName} preparation
        </p>
      </div>

      {/* Main Content */}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left Column - Strategy & Timer */}
        <div className="space-y-6">
          <StudyTimer />
          <SubjectCount subjects={user.subjects} />
        </div>

        {/* Right Column - Progress Overview & Exam Countdown */}
        <div className="space-y-6">
        <ExamCountdown 
            examDate={user.examDate} 
            dailyActivities={user.dailyActivities} 
          />
          <DashboardProgressOverview 
            progress={progress} 
            subjects={user.subjects} 
          />
        </div>
      </div>

    </div>
  )
}