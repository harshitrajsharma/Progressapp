'use client';

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { SubjectWithRelations } from "@/lib/calculations/types"
import { BookOpen, GraduationCap, CheckCircle2 } from "lucide-react"
import { calculateSubjectProgress } from "@/lib/calculations/progress"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"

type Category = 'overall' | 'learning' | 'revision' | 'practice' | 'test';

interface CategoryConfig {
  label: string;
  color: string;
  bgColor: string;
}

const categories: Record<Category, CategoryConfig> = {
  overall: { label: 'Overall', color: 'bg-primary', bgColor: 'bg-primary/10' },
  learning: { label: 'Learning', color: 'bg-blue-500', bgColor: 'bg-blue-500/10' },
  revision: { label: 'Revision', color: 'bg-green-500', bgColor: 'bg-green-500/10' },
  practice: { label: 'Practice', color: 'bg-orange-500', bgColor: 'bg-orange-500/10' },
  test: { label: 'Test', color: 'bg-purple-500', bgColor: 'bg-purple-500/10' }
};

interface SubjectsListProps {
  subjects: SubjectWithRelations[]
}

export function SubjectsList({ subjects }: SubjectsListProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('overall');

  // Sort subjects by weightage and calculate progress
  const sortedSubjects = useMemo(() => {
    return subjects
      .map(subject => ({
        ...subject,
        progress: calculateSubjectProgress(subject)
      }))
      .sort((a, b) => b.weightage - a.weightage);
  }, [subjects]);

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
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Subjects</h3>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </div>

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
              <div className={cn("w-2 h-2 rounded-full mr-2", config.color)} />
              <span className="text-xs">{config.label}</span>
            </Button>
          ))}
        </div>
        
        {/* Subjects List */}
        <div className="space-y-6">
          {sortedSubjects.map(({ progress, ...subject }) => (
            <div key={subject.id} className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{subject.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      {subject.weightage}% weightage
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {progress.foundationLevel}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <span>{Math.round(getProgressValue(progress, selectedCategory))}%</span>
                  {progress.overall >= 100 && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <Progress 
                value={getProgressValue(progress, selectedCategory)}
                className="h-2 bg-secondary/50"
                indicatorClassName={cn(
                  categories[selectedCategory].color,
                  "transition-all duration-300"
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
} 