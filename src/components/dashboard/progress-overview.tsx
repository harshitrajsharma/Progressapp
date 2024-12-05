"use client";

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { SubjectWithRelations } from "@/lib/calculations/types"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { calculateSubjectProgress } from "@/lib/calculations/progress"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

type Category = 'overall' | 'learning' | 'revision' | 'practice' | 'test';

interface CategoryConfig {
  label: string;
  color: string;
  bgColor: string;
  progressColor: string;
}

const categories: Record<Category, CategoryConfig> = {
  overall: { 
    label: 'Overall', 
    color: 'text-primary', 
    bgColor: 'bg-primary/10',
    progressColor: 'bg-primary'
  },
  learning: { 
    label: 'Learning', 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-500/10',
    progressColor: 'bg-blue-500'
  },
  revision: { 
    label: 'Revision', 
    color: 'text-green-500', 
    bgColor: 'bg-green-500/10',
    progressColor: 'bg-green-500'
  },
  practice: { 
    label: 'Practice', 
    color: 'text-orange-500', 
    bgColor: 'bg-orange-500/10',
    progressColor: 'bg-orange-500'
  },
  test: { 
    label: 'Test', 
    color: 'text-purple-500', 
    bgColor: 'bg-purple-500/10',
    progressColor: 'bg-purple-500'
  }
};

interface DashboardProgressOverviewProps {
  progress: {
    overall: number;
    learning: number;
    revision: number;
    practice: number;
    test: number;
  };
  subjects: SubjectWithRelations[];
}

export function DashboardProgressOverview({ progress, subjects }: DashboardProgressOverviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('overall');

  // Sort subjects by weightage and calculate progress
  const sortedSubjects = subjects
    .map(subject => ({
      ...subject,
      progress: calculateSubjectProgress(subject)
    }))
    .sort((a, b) => b.weightage - a.weightage);

  const getProgressValue = (progress: ReturnType<typeof calculateSubjectProgress>, category: Category) => {
    switch (category) {
      case 'learning': return progress.learning;
      case 'revision': return progress.revision;
      case 'practice': return progress.practice;
      case 'test': return progress.test;
      default: return progress.overall;
    }
  };

  return (
    <div className="space-y-4 dark:bg-black/90 rounded-lg bg-white">
      <Card className="p-4 bg-card">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Overall Progress</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall</span>
              <span className="font-medium">{Math.round(progress.overall)}%</span>
            </div>
            <Progress 
              value={progress.overall} 
              className="h-2 bg-secondary/50" 
              indicatorClassName="bg-primary"
            />
          </div>

          {/* Category Progress - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Learning */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-500">Learning</span>
                <span>{Math.round(progress.learning)}%</span>
              </div>
              <Progress value={progress.learning} className="h-1.5 bg-secondary/50" indicatorClassName="bg-blue-500" />
            </div>

            {/* Revision */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-500">Revision</span>
                <span>{Math.round(progress.revision)}%</span>
              </div>
              <Progress value={progress.revision} className="h-1.5 bg-secondary/50" indicatorClassName="bg-green-500" />
            </div>

            {/* Practice */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-orange-500">Practice</span>
                <span>{Math.round(progress.practice)}%</span>
              </div>
              <Progress value={progress.practice} className="h-1.5 bg-secondary/50" indicatorClassName="bg-orange-500" />
            </div>

            {/* Test */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-500">Test</span>
                <span>{Math.round(progress.test)}%</span>
              </div>
              <Progress value={progress.test} className="h-1.5 bg-secondary/50" indicatorClassName="bg-purple-500" />
            </div>
          </div>
        </div>
      </Card>

      {/* Expandable Category View */}
      <div className={cn(
        "grid transition-all duration-300",
        isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}>
        <div className="overflow-hidden">
          <Card className="p-4">
            <div className="space-y-4">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(categories).map(([key, config]) => (
                  <Button
                    key={key}
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "h-8 rounded-full",
                      selectedCategory === key && config.bgColor
                    )}
                    onClick={() => setSelectedCategory(key as Category)}
                  >
                    <div className={cn("w-2 h-2 rounded-full mr-2", config.progressColor)} />
                    <span className={cn("text-xs", config.color)}>{config.label}</span>
                  </Button>
                ))}
              </div>

              {/* Subjects List */}
              <div className="space-y-4">
                {sortedSubjects.map(({ progress, ...subject }) => (
                  <Link 
                    key={subject.id}
                    href={`/subjects/${subject.id}`}
                    className="block"
                  >
                    <div className={cn(
                      "space-y-2 p-3 rounded-lg border transition-colors cursor-pointer",
                      categories[selectedCategory].bgColor,
                      "hover:bg-opacity-20 bg-opacity-10"
                    )}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold hover:text-primary transition-colors">
                            {subject.name}
                          </h4>
                          <Badge variant="secondary" className={cn(
                            "text-xs font-medium",
                            categories[selectedCategory].color
                          )}>
                            {Math.round(getProgressValue(progress, selectedCategory))}%
                          </Badge>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="text-xs font-medium text-white bg-red-700"
                        >
                          {subject.weightage} Marks
                        </Badge>
                      </div>
                      <Progress 
                        value={getProgressValue(progress, selectedCategory)}
                        className="h-1.5 bg-secondary/50"
                        indicatorClassName={categories[selectedCategory].progressColor}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 