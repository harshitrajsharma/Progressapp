import React from 'react';
import { Button } from "@/components/ui/button"
import { BookOpen, BookCheck, PenLine, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

type ChapterCategory = 'learning' | 'revision' | 'practice' | 'test';

interface CategoryConfig {
  id: ChapterCategory;
  label: string;
  icon: React.ElementType;
  color: string;
  fillColor: string;
  activeColor: string;
  borderColor: string;
  shadowColor: string;
}

interface ChapterCategoriesProps {
  selectedCategory: ChapterCategory;
  onCategoryChange: (category: ChapterCategory) => void;
}

const categories: CategoryConfig[] = [
  { 
    id: 'learning', 
    label: 'Learning',
    icon: GraduationCap,
    color: 'text-emerald-400',
    fillColor: 'bg-emerald-500/30',
    activeColor: 'bg-emerald-500',
    borderColor: 'border-emerald-500',
    shadowColor: 'shadow-emerald-500/30'
  },
  { 
    id: 'revision', 
    label: 'Revision',
    icon: BookCheck,
    color: 'text-blue-400',
    fillColor: 'bg-blue-500/30',
    activeColor: 'bg-blue-500',
    borderColor: 'border-blue-500',
    shadowColor: 'shadow-blue-500/30'
  },
  { 
    id: 'practice', 
    label: 'Practice',
    icon: PenLine,
    color: 'text-amber-400',
    fillColor: 'bg-amber-500/30',
    activeColor: 'bg-amber-500',
    borderColor: 'border-amber-500',
    shadowColor: 'shadow-amber-500/30'
  },
  { 
    id: 'test', 
    label: 'Test',
    icon: BookOpen,
    color: 'text-purple-400',
    fillColor: 'bg-purple-500/30',
    activeColor: 'bg-purple-500',
    borderColor: 'border-purple-500',
    shadowColor: 'shadow-purple-500/30'
  }
];

export function ChapterCategories({ 
  selectedCategory, 
  onCategoryChange 
}: ChapterCategoriesProps) {
  return (
    <div className="md:flex grid grid-cols-2 gap-3 p-2">
      {categories.map(category => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.id;

        return (
          <Button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              // Base styles
              "relative flex items-center gap-2 rounded-full",
              "border-2 transition-all duration-300",
              "hover:shadow-lg",
              
              // Default state
              !isSelected && [
                "backdrop-blur-sm",
                "bg-white/5",
                " border-black/20 dark:border-gray-200/20",
                "hover:bg-white/10",
                "dark:hover:border-white/30",
                "shadow-sm"
              ],
              
              // Selected state with fill color and depth
              isSelected && [
                category.fillColor,
                category.borderColor,
                category.shadowColor,
                "shadow-lg",
                `hover:${category.fillColor}`,
                "border-opacity-100",
              ]
            )}
          >
            {/* Icon */}
            <div className={cn(
              "relative flex items-center justify-center",
              "transition-all duration-300 ease-out",
              isSelected ? "scale-110" : "group-hover:scale-105"
            )}>
              <Icon className={cn(
                "h-4 w-4",
                isSelected ? "text-white" : category.color,
                "transition-all duration-300"
              )} />
            </div>

            {/* Label */}
            <span className={cn(
              "relative text-sm font-medium",
              "transition-all duration-300",
              isSelected ? "text-white" : "text-black dark:text-gray-200"
            )}>
              {category.label}
            </span>

            {/* Interactive gradient overlay */}
            <div className={cn(
              "absolute inset-0 rounded-full opacity-0",
              "transition-opacity duration-300",
              "bg-white/10",
              "hover:opacity-20",
              isSelected && "opacity-0"
            )} />
          </Button>
        );
      })}
    </div>
  );
}

export default ChapterCategories;