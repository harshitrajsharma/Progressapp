import React, { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubjectWithRelations } from "@/lib/calculations/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { calculateSubjectProgress } from "@/lib/calculations/progress";
import { Category, CATEGORIES } from "@/types/progress";
import { Star, TrendingUp } from 'lucide-react';

interface CategoryViewProps {
  subjects: SubjectWithRelations[];
  initialCategory?: Category;
  getProgressValue: (progress: ReturnType<typeof calculateSubjectProgress>, category: Category) => number;
  className?: string;
}

export function CategoryView({ 
  subjects, 
  initialCategory = 'overall',
  getProgressValue,
  className 
}: CategoryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>(initialCategory);
  const [sortMethod, setSortMethod] = useState<'weightage' | 'progress'>('weightage');

  // Precise subject processing with memoized computation
  const processedSubjects = useMemo(() => {
    return subjects
      .map(subject => ({
        ...subject,
        progress: calculateSubjectProgress(subject)
      }))
      .sort((a, b) => {
        if (sortMethod === 'weightage') return b.weightage - a.weightage;
        return getProgressValue(b.progress, selectedCategory) - 
               getProgressValue(a.progress, selectedCategory);
      });
  }, [subjects, selectedCategory, sortMethod, getProgressValue]);

  return (
    <Card 
      className={cn(
        "p-6 space-y-6 shadow-md hover:shadow-lg transition-shadow duration-300",
        className
      )}
    >
      {/* Precision-Engineered Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold tracking-tight text-blue-500">
          Subject Progress Analysis
        </h2>

        {/* Intelligent Sorting Mechanism */}
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => setSortMethod(
            sortMethod === 'weightage' ? 'progress' : 'weightage'
          )}
        >
          {sortMethod === 'weightage' ? (
            <Star className="h-4 w-4" />
          ) : (
            <TrendingUp className="h-4 w-4" />
          )}
          Sort by {sortMethod === 'weightage' ? 'Progress' : 'Weightage'}
        </Button>
      </div>

      {/* Semantically Structured Category Filters */}
      <div 
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Progress Categories"
      >
        {Object.entries(CATEGORIES).map(([key, config]) => (
          <Button
            key={key}
            role="tab"
            aria-selected={selectedCategory === key}
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-full transition-colors duration-200",
              selectedCategory === key 
                ? `${config.bgColor} shadow-md` 
                : "hover:bg-secondary/20"
            )}
            onClick={() => setSelectedCategory(key as Category)}
          >
            <div 
              className={cn(
                "w-2 h-2 rounded-full", 
                config.progressColor
              )} 
            />
            <span className="text-sm font-medium">{config.label}</span>
          </Button>
        ))}
      </div>

      {/* Methodically Structured Subjects List */}
      <div className="space-y-2">
        {processedSubjects.map(({ progress, ...subject }) => (
          <Link 
            key={subject.id} 
            href={`/subjects/${subject.id}`}
            className="block"
          >
            <div 
              className={cn(
                "p-4 rounded-lg border transition-all duration-200",
                "hover:shadow-md group",
                CATEGORIES[selectedCategory].bgColor,
                "bg-opacity-10 hover:bg-opacity-20"
              )}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {subject.name}
                  </h3>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs font-medium",
                      CATEGORIES[selectedCategory].color
                    )}
                  >
                    {Math.round(getProgressValue(progress, selectedCategory))}%
                  </Badge>
                </div>
                <Badge 
                  variant="outline" 
                  className="text-xs font-medium text-white bg-destructive"
                >
                  {subject.weightage} Marks
                </Badge>
              </div>
              <Progress 
                value={getProgressValue(progress, selectedCategory)}
                className="h-1.5 bg-secondary/50"
                indicatorClassName={CATEGORIES[selectedCategory].progressColor}
              />
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}