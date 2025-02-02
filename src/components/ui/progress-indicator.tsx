'use client';

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Category, CATEGORIES } from "@/types/progress";

interface ProgressIndicatorProps {
  label: string;
  value: number;
  category: Category;
  size?: 'sm' | 'md';
  className?: string;
}

export function ProgressIndicator({
  label,
  value,
  category,
  size = 'md',
  className
}: ProgressIndicatorProps) {
  const config = CATEGORIES[category];
  const roundedValue = Math.round(value);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className={cn(
          "font-medium",
          size === 'sm' ? 'text-xs' : 'text-sm',
          config.color
        )}>
          {label}
        </span>
        <span className={cn(
          "font-medium",
          size === 'sm' ? 'text-xs' : 'text-sm',
          config.color
        )}>
          {roundedValue}%
        </span>
      </div>
      <Progress 
        value={roundedValue} 
        className={cn(
          "bg-secondary/50",
          size === 'sm' ? 'h-1.5' : 'h-2'
        )}
        indicatorClassName={config.progressColor}
      />
    </div>
  );
} 