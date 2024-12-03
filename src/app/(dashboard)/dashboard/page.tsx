import { Suspense } from 'react'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { withRetry } from "@/lib/db"
import Loading from "@/components/loading"
import { EnhancedCountdown } from "@/components/dashboard/enhanced-countdown"
import { CompetitiveAnalysis } from "@/components/dashboard/competitive-analysis"
import { QuickStats } from "@/components/dashboard/quick-stats"
import { StudyTimer } from "@/components/dashboard/study-timer"
import { redirect } from "next/navigation"
import { User, MockTest, DailyActivity, StudyStreak } from "@prisma/client"
import { SubjectWithRelations } from "@/lib/calculations/types"
import { calculateDashboardStats } from "@/lib/calculations/dashboard"

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
          take: 7 // Last 7 days
        }
      },
    })
    return user
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

  const mockTestScores = user.mockTests.map(test => test.score)
  const currentScore = mockTestScores.length > 0
    ? mockTestScores[mockTestScores.length - 1]
    : 0

  const dashboardStats = calculateDashboardStats(
    user.subjects,
    user.dailyActivities,
    user.studyStreak,
    user.mockTests
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your {user.examName} preparation
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr,300px]">
        <div className="space-y-8">
          <EnhancedCountdown 
            examDate={user.examDate} 
            examName={user.examName} 
          />

          <QuickStats stats={dashboardStats} />

          <CompetitiveAnalysis
            currentScore={currentScore}
            targetScore={user.targetScore || 0}
            mockTestScores={mockTestScores}
          />
        </div>

        <div className="space-y-8">
          <StudyTimer />
          {/* More sidebar components will go here */}
        </div>
      </div>
    </div>
  )
} 