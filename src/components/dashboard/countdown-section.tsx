'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Timer, Calendar, BookOpen } from 'lucide-react'
import { cn } from "@/lib/utils"
import { useProgress } from "@/components/providers/progress-provider"

interface CountdownSectionProps {
  examDate: Date
  examName: string
  subjectId: string
}

const motivationalMessages = [
  "Every hour of study brings you closer to success!",
  "You're building your future, one concept at a time.",
  "Stay focused, your GATE success story is being written now.",
  "Small progress each day adds up to big results.",
  "Your dedication today determines your ranking tomorrow.",
]

export function CountdownSection({ examDate, examName, subjectId }: CountdownSectionProps) {
  const { overall: progress } = useProgress(subjectId);
  const [daysLeft, setDaysLeft] = useState(0)
  const [studyDaysLeft, setStudyDaysLeft] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const calculateDays = () => {
      const now = new Date()
      const totalDays = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      setDaysLeft(totalDays)

      // Calculate study days (excluding weekends)
      let studyDays = 0
      let currentDate = new Date()
      while (currentDate < examDate) {
        const day = currentDate.getDay()
        if (day !== 0) { // Excluding Sundays
          studyDays++
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
      setStudyDaysLeft(studyDays)
    }

    calculateDays()
    const interval = setInterval(calculateDays, 1000 * 60 * 60) // Update every hour

    // Update motivation message daily
    const today = new Date().getDate()
    setMessage(motivationalMessages[today % motivationalMessages.length])

    return () => clearInterval(interval)
  }, [examDate])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Days Until {examName}</CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{daysLeft}</div>
          <div className="text-xs text-muted-foreground">
            {message}
          </div>
          <Progress value={progress} className="mt-3" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Study Days Left</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{studyDaysLeft}</div>
          <p className="text-xs text-muted-foreground">
            Excluding Sundays
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Study Target</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.ceil(studyDaysLeft > 0 ? (100 - progress) / studyDaysLeft : 0)}%</div>
          <p className="text-xs text-muted-foreground">
            Progress needed per day
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Preparation Progress</CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(progress)}%</div>
          <Progress 
            value={progress} 
            className="mt-3"
            indicatorClassName={cn(
              progress < 30 ? "bg-red-500" :
              progress < 70 ? "bg-yellow-500" :
              "bg-green-500"
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
} 