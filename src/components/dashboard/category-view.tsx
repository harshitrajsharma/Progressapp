import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SubjectWithRelations } from "@/lib/calculations/types"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { calculateSubjectProgress } from "@/lib/calculations/progress"
import { Category, CATEGORIES } from "@/types/progress"

interface CategoryViewProps {
  subjects: SubjectWithRelations[];
  isExpanded: boolean;
  selectedCategory: Category;
  onCategorySelect: (category: Category) => void;
  getProgressValue: (progress: ReturnType<typeof calculateSubjectProgress>, category: Category) => number;
  className?: string;
}

// Category Filter Button Component
function CategoryFilterButton({ 
  config, 
  isSelected, 
  onClick 
}: { 
  category: Category; 
  config: typeof CATEGORIES[Category];
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      size="sm"
      variant="ghost"
      className={cn(
        "h-8 rounded-full",
        isSelected && config.bgColor
      )}
      onClick={onClick}
    >
      <div className={cn("w-2 h-2 rounded-full mr-2", config.progressColor)} />
      <span className={cn("text-xs", config.color)}>{config.label}</span>
    </Button>
  );
}

// Subject Progress Item Component
function SubjectProgressItem({
  subject,
  progress,
  category,
  config,
  getProgressValue
}: {
  subject: Omit<SubjectWithRelations, 'progress'>;
  progress: ReturnType<typeof calculateSubjectProgress>;
  category: Category;
  config: typeof CATEGORIES[Category];
  getProgressValue: (progress: ReturnType<typeof calculateSubjectProgress>, category: Category) => number;
}) {
  return (
    <Link 
      href={`/subjects/${subject.id}`}
      className={cn("block")}
    >
      <div className={cn(
        "space-y-2 p-3 rounded-lg border transition-colors cursor-pointer",
        config.bgColor,
        "hover:bg-opacity-20 bg-opacity-10"
      )}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold hover:text-primary transition-colors">
              {subject.name}
            </h4>
            <Badge variant="secondary" className={cn(
              "text-xs font-medium",
              config.color
            )}>
              {Math.round(getProgressValue(progress, category))}%
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
          value={getProgressValue(progress, category)}
          className="h-1.5 bg-secondary/50"
          indicatorClassName={config.progressColor}
        />
      </div>
    </Link>
  );
}

export function CategoryView({ 
  subjects, 
  isExpanded, 
  selectedCategory, 
  onCategorySelect,
  getProgressValue,
  className
}: CategoryViewProps) {
  // Sort subjects by weightage and calculate progress
  const sortedSubjects = subjects
    .map(subject => ({
      ...subject,
      progress: calculateSubjectProgress(subject)
    }))
    .sort((a, b) => b.weightage - a.weightage);

  return (
    <div className={cn(
      "grid transition-all duration-300",
      isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      className
    )}>
      <div className="overflow-hidden">
        <Card className="p-4">
          <div className="space-y-4">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORIES).map(([key, config]) => (
                <CategoryFilterButton
                  key={key}
                  category={key as Category}
                  config={config}
                  isSelected={selectedCategory === key}
                  onClick={() => onCategorySelect(key as Category)}
                />
              ))}
            </div>

            {/* Subjects List */}
            <div className="space-y-4">
              {sortedSubjects.map(({ progress, ...subject }) => (
                <SubjectProgressItem
                  key={subject.id}
                  subject={subject}
                  progress={progress}
                  category={selectedCategory}
                  config={CATEGORIES[selectedCategory]}
                  getProgressValue={getProgressValue}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 