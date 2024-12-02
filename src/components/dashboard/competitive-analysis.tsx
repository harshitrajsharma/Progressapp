'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, TrendingUp, Target, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { predictGateRank, getScoreInsights, getImprovementSuggestions } from '@/lib/gate-analytics'

interface CompetitiveAnalysisProps {
  currentScore: number
  targetScore?: number
  mockTestScores?: number[]
}

export function CompetitiveAnalysis({ 
  currentScore, 
  targetScore = 75, // Default target score for GATE CSE
  mockTestScores = [] 
}: CompetitiveAnalysisProps) {
  const prediction = predictGateRank(currentScore)
  const insights = getScoreInsights(currentScore)
  const suggestions = getImprovementSuggestions(currentScore, targetScore)
  const scoreImprovement = mockTestScores.length > 1 
    ? mockTestScores[mockTestScores.length - 1] - mockTestScores[0]
    : 0

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected AIR</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Trophy className={cn(
                    "h-4 w-4",
                    prediction.confidence === 'high' ? "text-green-500" :
                    prediction.confidence === 'medium' ? "text-yellow-500" :
                    "text-red-500"
                  )} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Prediction confidence: {prediction.confidence}</p>
                  {prediction.confidence !== 'high' && (
                    <p className="text-xs mt-1 text-muted-foreground">
                      Take more mock tests to improve accuracy
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prediction.minRank === prediction.maxRank 
                ? prediction.minRank.toLocaleString()
                : `${prediction.minRank.toLocaleString()}-${prediction.maxRank.toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on current performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Percentile</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TrendingUp className={cn(
                    "h-4 w-4",
                    prediction.percentile >= 99 ? "text-green-500" :
                    prediction.percentile >= 95 ? "text-yellow-500" :
                    "text-red-500"
                  )} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Based on historical GATE data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prediction.percentile.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Top {(100 - prediction.percentile).toFixed(1)}% of candidates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Gap</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Target className={cn(
                    "h-4 w-4",
                    currentScore >= targetScore ? "text-green-500" :
                    targetScore - currentScore <= 10 ? "text-yellow-500" :
                    "text-red-500"
                  )} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Gap to reach your target score</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(0, targetScore - currentScore).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Points to reach target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Improvement</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className={cn(
                    "h-4 w-4",
                    scoreImprovement > 10 ? "text-green-500" :
                    scoreImprovement > 0 ? "text-yellow-500" :
                    "text-red-500"
                  )} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Improvement since first mock test</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scoreImprovement > 0 ? '+' : ''}{scoreImprovement.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Points improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {(insights.length > 0 || suggestions.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Analysis & Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            {insights.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Current Standing</h4>
                <ul className="space-y-2">
                  {insights.map((insight, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Improvement Plan</h4>
                <ul className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button className="mt-4 w-full" variant="outline">
              View Detailed Analysis
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 