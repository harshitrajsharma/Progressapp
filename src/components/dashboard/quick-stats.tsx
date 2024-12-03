'use client';

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, BookOpen, TestTube, Target, TrendingUp, Calendar } from "lucide-react"
import { DashboardStats } from "@/lib/calculations/dashboard"
import { useSmoothTransition } from "@/hooks/use-smooth-transition"
import { cn } from "@/lib/utils"

interface QuickStatsProps {
  stats: DashboardStats;
  transitionDuration?: number;
}

export function QuickStats({ 
  stats, 
  transitionDuration = 300 
}: QuickStatsProps) {
  const { displayValue: displayStats, getTransitionClass } = useSmoothTransition(stats, {
    duration: transitionDuration
  });

  const { dailyProgress, weeklyProgress } = displayStats;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Daily Study Hours */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Study Hours</span>
        </div>
        <div className="mt-3">
          <div className={cn(
            "text-2xl font-bold",
            getTransitionClass(transitionDuration)
          )}>
            {dailyProgress.hoursStudied}h
          </div>
          <Progress 
            value={dailyProgress.targetCompletion} 
            className="h-2 mt-2"
            transitionDuration={transitionDuration}
          />
          <p className={cn(
            "mt-2 text-xs text-muted-foreground",
            getTransitionClass(transitionDuration)
          )}>
            {dailyProgress.targetCompletion.toFixed(0)}% of daily goal
          </p>
        </div>
      </Card>

      {/* Topics Covered */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">Topics Covered</span>
        </div>
        <div className="mt-3">
          <div className={cn(
            "text-2xl font-bold",
            getTransitionClass(transitionDuration)
          )}>
            {dailyProgress.topicsCovered}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className={cn(
              "text-xs text-muted-foreground",
              getTransitionClass(transitionDuration)
            )}>
              {weeklyProgress.totalTopicsCovered} this week
            </span>
          </div>
        </div>
      </Card>

      {/* Tests Completed */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <TestTube className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium">Tests Completed</span>
        </div>
        <div className="mt-3">
          <div className={cn(
            "text-2xl font-bold",
            getTransitionClass(transitionDuration)
          )}>
            {dailyProgress.testsCompleted}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className={cn(
              "text-xs text-muted-foreground",
              getTransitionClass(transitionDuration)
            )}>
              {weeklyProgress.totalTestsTaken} this week
            </span>
          </div>
        </div>
      </Card>

      {/* Weekly Progress */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium">Weekly Progress</span>
        </div>
        <div className="mt-3">
          <div className={cn(
            "text-2xl font-bold",
            getTransitionClass(transitionDuration)
          )}>
            {weeklyProgress.averageHoursPerDay}h
          </div>
          <Progress 
            value={weeklyProgress.weeklyGoalCompletion} 
            className="h-2 mt-2"
            transitionDuration={transitionDuration}
          />
          <p className={cn(
            "mt-2 text-xs text-muted-foreground",
            getTransitionClass(transitionDuration)
          )}>
            {weeklyProgress.weeklyGoalCompletion.toFixed(0)}% of weekly goal
          </p>
        </div>
      </Card>
    </div>
  )
} 