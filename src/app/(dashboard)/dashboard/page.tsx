import { Suspense } from 'react'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { withRetry } from "@/lib/db"
import ErrorBoundary from "@/components/error-boundary"
import Loading from "@/components/loading"
import { CountdownSection } from "@/components/dashboard/countdown-section"
import { CompetitiveAnalysis } from "@/components/dashboard/competitive-analysis"
import { redirect } from "next/navigation"

async function getDashboardData(email: string) {
  return await withRetry(async () => {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subjects: {
          include: {
            tests: true,
            mockTests: true,
          }
        },
        mockTests: {
          orderBy: {
            createdAt: 'desc'
          }
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
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <DashboardContent userEmail={session.user.email} />
      </Suspense>
    </ErrorBoundary>
  )
}

async function DashboardContent({ userEmail }: { userEmail: string }) {
  const user = await getDashboardData(userEmail)
  if (!user?.examName || !user.examDate) redirect("/onboarding")

  // Calculate current score from mock tests
  const mockTestScores = user.mockTests.map(test => test.score)
  const currentScore = mockTestScores.length > 0
    ? mockTestScores[mockTestScores.length - 1]
    : 0

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground">
          Here's an overview of your {user.examName} preparation
        </p>
      </div>

      <CountdownSection 
        examDate={user.examDate} 
        examName={user.examName} 
      />

      <CompetitiveAnalysis
        currentScore={currentScore}
        targetScore={user.targetScore || 0}
        mockTestScores={mockTestScores}
      />
      
      {/* We'll add more sections here */}
    </div>
  )
} 