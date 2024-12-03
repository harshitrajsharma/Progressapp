'use client';

import { Button } from "@/components/ui/button"
import { BookOpen, BookCheck, PenLine, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

export type ChapterCategory = 'learning' | 'revision' | 'practice' | 'test';

interface ChapterCategoriesProps {
  selectedCategory: ChapterCategory;
  onCategoryChange: (category: ChapterCategory) => void;
  variant?: 'default' | 'icon';
}

export function ChapterCategories({ 
  selectedCategory, 
  onCategoryChange,
  variant = 'default'
}: ChapterCategoriesProps) {
  const categories = [
    { 
      id: 'learning' as const, 
      label: 'Learning',
      icon: GraduationCap,
      color: 'text-blue-500 dark:text-blue-400',
      activeColor: 'bg-blue-500/10 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300',
      hoverColor: 'hover:bg-blue-50 dark:hover:bg-blue-950/50',
      outlineColor: 'border-blue-200/50 dark:border-blue-800/50',
      defaultColor: 'bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:from-blue-500 hover:to-blue-600 text-white backdrop-blur-sm'
    },
    { 
      id: 'revision' as const, 
      label: 'Revision',
      icon: BookCheck,
      color: 'text-green-500 dark:text-green-400',
      activeColor: 'bg-green-500/10 text-green-700 dark:bg-green-400/10 dark:text-green-300',
      hoverColor: 'hover:bg-green-50 dark:hover:bg-green-950/50',
      outlineColor: 'border-green-200/50 dark:border-green-800/50',
      defaultColor: 'bg-gradient-to-br from-green-500/90 to-green-600/90 hover:from-green-500 hover:to-green-600 text-white backdrop-blur-sm'
    },
    { 
      id: 'practice' as const, 
      label: 'Practice',
      icon: PenLine,
      color: 'text-amber-500 dark:text-amber-400',
      activeColor: 'bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300',
      hoverColor: 'hover:bg-amber-50 dark:hover:bg-amber-950/50',
      outlineColor: 'border-amber-200/50 dark:border-amber-800/50',
      defaultColor: 'bg-gradient-to-br from-amber-500/90 to-amber-600/90 hover:from-amber-500 hover:to-amber-600 text-white backdrop-blur-sm'
    },
    { 
      id: 'test' as const, 
      label: 'Test',
      icon: BookOpen,
      color: 'text-purple-500 dark:text-purple-400',
      activeColor: 'bg-purple-500/10 text-purple-700 dark:bg-purple-400/10 dark:text-purple-300',
      hoverColor: 'hover:bg-purple-50 dark:hover:bg-purple-950/50',
      outlineColor: 'border-purple-200/50 dark:border-purple-800/50',
      defaultColor: 'bg-gradient-to-br from-purple-500/90 to-purple-600/90 hover:from-purple-500 hover:to-purple-600 text-white backdrop-blur-sm'
    }
  ];

  if (variant === 'default') {
    return (
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
        {categories.map(category => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;

          return (
            <Button
              key={category.id}
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "w-full sm:w-auto gap-2 border-2 rounded-xl transition-all duration-300",
                "shadow-sm backdrop-blur-sm",
                isSelected 
                  ? cn(category.defaultColor, "scale-[1.02]")
                  : cn(
                      "hover:bg-transparent hover:scale-[1.02]", 
                      category.outlineColor, 
                      category.color,
                      "bg-white/50 dark:bg-gray-950/50"
                    )
              )}
            >
              <Icon className={cn(
                "h-4 w-4 transition-transform duration-300",
                isSelected ? "text-current" : category.color
              )} />
              {category.label}
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(category => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.id;

        return (
          <Button
            key={category.id}
            variant="ghost"
            className={cn(
              "flex items-center gap-2 rounded-full border-2 transition-all duration-200",
              isSelected 
                ? cn(
                    category.activeColor,
                    "border-transparent font-semibold shadow-sm",
                    "ring-1 ring-black/[0.05] dark:ring-white/[0.05]"
                  )
                : cn(
                    "border-transparent",
                    category.hoverColor,
                    category.color
                  )
            )}
            onClick={() => onCategoryChange(category.id)}
          >
            <Icon className={cn(
              "h-4 w-4",
              !isSelected && "transition-transform group-hover:scale-110"
            )} />
            <span className={cn(
              "transition-all duration-200",
              isSelected && "font-semibold"
            )}>
              {category.label}
            </span>
          </Button>
        );
      })}
    </div>
  );
} 