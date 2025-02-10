import React from 'react';
import { Button } from "@/components/ui/button"
import { BookOpen, BookCheck, PenLine, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChapterCategory, CategoryConfig } from "@/types/prisma/category"

type ChapterCategoriesProps = {
  selectedCategory: ChapterCategory;
  onCategoryChange: (category: ChapterCategory) => void;
}

const categories: CategoryConfig[] = [
  { 
    id: 'learning', 
    label: 'Learning',
    icon: GraduationCap,
    color: 'text-emerald-400',
    activeColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30'
  },
  { 
    id: 'revision', 
    label: 'Revision',
    icon: BookCheck,
    color: 'text-blue-400',
    activeColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30'
  },
  { 
    id: 'practice', 
    label: 'Practice',
    icon: PenLine,
    color: 'text-amber-400',
    activeColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30'
  },
  { 
    id: 'test', 
    label: 'Test',
    icon: BookOpen,
    color: 'text-purple-400',
    activeColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30'
  }
];

export function ChapterCategories({ 
  selectedCategory, 
  onCategoryChange 
}: ChapterCategoriesProps) {
  return (
    <div className="md:flex grid grid-cols-2 gap-2 p-1">
      {categories.map(category => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.id;

        return (
          <Button
            key={category.id}
            variant="ghost"
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "relative flex items-center gap-2 rounded-full border-2 transition-all duration-200",
              isSelected 
                ? cn(
                    "shadow-md",
                    category.borderColor,
                    category.activeColor,
                  )
                : cn(
                    category.borderColor,
                    "hover:border-gray-700/50",
                    `hover:bg-gray-400/30`
                  )
            )}
          >
            <Icon className={cn(
              "h-4 w-4 transition-transform duration-200",
              category.color,
              isSelected && "scale-110"
            )} />
            <span className={cn(
              "text-sm font-medium",
            )}>
              {category.label}
            </span>
          </Button>
        );
      })}
    </div>
  );
}