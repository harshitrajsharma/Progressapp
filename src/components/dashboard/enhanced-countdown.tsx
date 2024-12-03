'use client';

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getDaysUntilGATE } from "@/lib/utils"
import { useStudyStreak } from "@/hooks/use-study-streak"
import { Flame, Calendar, Clock, Trophy } from "lucide-react"

import { useEffect, useState } from "react"

interface EnhancedCountdownProps {
  examDate: Date
  examName: string
}

export function EnhancedCountdown({ examDate, examName }: EnhancedCountdownProps) {
  const { streak, loading } = useStudyStreak()
  const daysLeft = getDaysUntilGATE()
  const formattedDate = new Date(examDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Calculate percentage of academic year completed
  const startDate = new Date(examDate)
  startDate.setMonth(startDate.getMonth() - 12) // Assuming 1 year prep
  const totalDays = 365
  const daysCompleted = totalDays - daysLeft
  const progressPercentage = (daysCompleted / totalDays) * 100

  // State for smooth transitions
  const [displayStreak, setDisplayStreak] = useState(streak);
  const [displayProgress, setDisplayProgress] = useState(progressPercentage);

  useEffect(() => {
    if (streak && !loading) {
      setDisplayStreak(streak);
    }
  }, [streak, loading]);

  useEffect(() => {
    if (typeof progressPercentage === 'number' && !isNaN(progressPercentage)) {
      setDisplayProgress(progressPercentage);
    }
  }, [progressPercentage]);

  // Get motivational message based on days left
  const getMotivationalMessage = () => {
    if (daysLeft > 180) return "You've got time, but start strong! 💪"
    if (daysLeft > 90) return "Keep pushing, you're on track! 🎯"
    if (daysLeft > 30) return "The finish line is approaching! 🏃"
    return "Final sprint, give it your all! 🚀"
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Main Countdown */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-bold text-primary transition-all duration-300">
            {daysLeft} Days Left
          </h2>
          <p className="text-muted-foreground">Until {examName}</p>
        </div>
        <div className="text-center sm:text-right">
          <p className="text-sm text-muted-foreground">Exam Date</p>
          <p className="font-medium">{formattedDate}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={displayProgress} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Preparation Progress</span>
          <span className="transition-all duration-300">{Math.round(displayProgress)}%</span>
        </div>
      </div>

      {/* Study Streak and Stats */}
      {!loading && displayStreak && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="flex flex-col items-center p-2 bg-secondary rounded-lg">
            <Flame className="h-5 w-5 text-orange-500 mb-1" />
            <p className="text-2xl font-bold transition-all duration-300">
              {displayStreak.currentStreak}
            </p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          <div className="flex flex-col items-center p-2 bg-secondary rounded-lg">
            <Trophy className="h-5 w-5 text-yellow-500 mb-1" />
            <p className="text-2xl font-bold transition-all duration-300">
              {displayStreak.longestStreak}
            </p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
          <div className="flex flex-col items-center p-2 bg-secondary rounded-lg">
            <Clock className="h-5 w-5 text-blue-500 mb-1" />
            <p className="text-2xl font-bold transition-all duration-300">
              {displayStreak.dailyProgress}
            </p>
            <p className="text-xs text-muted-foreground">Hours Today</p>
          </div>
          <div className="flex flex-col items-center p-2 bg-secondary rounded-lg">
            <Calendar className="h-5 w-5 text-green-500 mb-1" />
            <p className="text-2xl font-bold transition-all duration-300">
              {displayStreak.dailyGoals}
            </p>
            <p className="text-xs text-muted-foreground">Daily Goal</p>
          </div>
        </div>
      )}

      {/* Motivational Message */}
      <p className="text-sm text-center font-medium text-muted-foreground">
        {getMotivationalMessage()}
      </p>
    </Card>
  )
} 