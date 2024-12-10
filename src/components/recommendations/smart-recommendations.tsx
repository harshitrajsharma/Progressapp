"use client";

import { SubjectWithRelations } from "@/lib/calculations/types";
import { useSession } from "next-auth/react";
import { getSmartRecommendations } from "@/lib/recommendations/smart-recommendations";
import { SubjectCard } from "./subject-card";
import { RecommendationSection } from "./recommendation-section";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SmartRecommendationsProps {
  subjects: SubjectWithRelations[];
}

const MATH_SUBJECTS = ["Discrete Maths", "Engineering Maths", "Aptitude"] as const;
type MathSubject = typeof MATH_SUBJECTS[number];

function isMathSubject(name: string): name is MathSubject {
  return MATH_SUBJECTS.includes(name as MathSubject);
}

function filterPriorityFocusSubjects(subjects: Array<{ subject: SubjectWithRelations; learningProgress: number }>) {
  // First, get all math subjects with progress
  const mathSubjects = subjects.filter(({ subject, learningProgress }) => 
    isMathSubject(subject.name) && 
    learningProgress > 0 && 
    learningProgress < 100
  );

  // Get all non-math subjects with progress
  const nonMathSubjects = subjects.filter(({ subject, learningProgress }) => 
    !isMathSubject(subject.name) && 
    learningProgress > 0 && 
    learningProgress < 100
  );

  // Sort both arrays by learning progress
  const sortedMathSubjects = mathSubjects.sort((a, b) => b.learningProgress - a.learningProgress);
  const sortedNonMathSubjects = nonMathSubjects.sort((a, b) => b.learningProgress - a.learningProgress);

  // Take top 2 non-math subjects
  const selectedNonMath = sortedNonMathSubjects.slice(0, 2);
  
  // Take the math subject with highest progress
  const selectedMath = sortedMathSubjects.slice(0, 1);

  // Combine: 2 non-math subjects first, then 1 math subject
  return [...selectedNonMath, ...selectedMath];
}

export function SmartRecommendations({ subjects }: SmartRecommendationsProps) {
  const recommendations = getSmartRecommendations(subjects);
  const { data: session } = useSession();

  // Get subjects for each category
  const reviseSubjects = recommendations.revise.slice(0, 3);
  const priorityFocusSubjects = filterPriorityFocusSubjects(recommendations.priorityFocus);
  const startNextSubjects = recommendations.startNext.slice(0, 3);

  return (
    <Card className="p-4 bg-background/50 backdrop-blur-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Smart Recommendations</h1>
            <p className="text-sm text-muted-foreground">
              Based on your progress and {session?.user?.examName || "exam"} weightage
            </p>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RecommendationSection
            title="Revise"
            description="Subjects that need revision based on your learning progress"
            className="bg-emerald-100 dark:bg-emerald-900/40"
          >
            {reviseSubjects.map(({ subject, revisionProgress }) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                progress={revisionProgress}
                weightage={subject.weightage}
                status="Revise Now"
                statusColor="text-orange-500"
                className="bg-emerald-50 dark:bg-emerald-900/60 hover:bg-emerald-100/80 dark:hover:bg-emerald-800/80"
                variant="emerald"
              />
            ))}
          </RecommendationSection>

          <RecommendationSection
            title="Priority Focus"
            description="Subjects that need immediate attention based on learning progress"
            className="bg-blue-100 dark:bg-blue-900/40"
          >
            {priorityFocusSubjects.map(({ subject, learningProgress }, index) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                progress={learningProgress}
                weightage={subject.weightage}
                behindTarget={index === 2 ? undefined : 17}
                status={index === 2 ? "Math Subject - Focus Required" : undefined}
                statusColor="text-blue-500"
                className={cn(
                  "bg-blue-50 dark:bg-blue-900/60 hover:bg-blue-100/80 dark:hover:bg-blue-800/80",
                  index === 2 && "mt-4 border-t-2 border-blue-200 dark:border-blue-800 pt-2"
                )}
                variant="blue"
              />
            ))}
          </RecommendationSection>

          <RecommendationSection
            title="Start Next"
            description={`Recommended subjects to start based on ${session?.user?.examName || "exam"} weightage`}
            className="bg-amber-100 dark:bg-amber-900/40"
          >
            {startNextSubjects.map(({ subject, weightage }) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                progress={0}
                weightage={weightage}
                status="High priority - Start soon"
                statusColor="text-orange-500"
                className="bg-amber-50 dark:bg-amber-900/60 hover:bg-amber-100/80 dark:hover:bg-amber-800/80"
                variant="amber"
              />
            ))}
          </RecommendationSection>
        </div>
      </div>
    </Card>
  );
} 