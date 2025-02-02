import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Category, CATEGORIES } from "@/types/progress"

interface ProgressIndicatorProps {
  label: string;
  value: number;
  category: Category;
  size?: 'sm' | 'md';
}

export function ProgressIndicator({ 
  label, 
  value, 
  category,
  size = 'sm'
}: ProgressIndicatorProps) {
  const config = CATEGORIES[category];
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className={config.color}>{label}</span>
        <span className={cn(
          category === 'overall' && "font-medium"
        )}>
          {Math.round(value)}%
        </span>
      </div>
      <Progress 
        value={value} 
        className={cn(
          "bg-secondary/50",
          size === 'sm' ? "h-1.5" : "h-2"
        )}
        indicatorClassName={config.progressColor}
      />
    </div>
  );
} 