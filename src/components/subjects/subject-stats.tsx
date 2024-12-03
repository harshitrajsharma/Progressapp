import { GraduationCap, BookOpen, Info, LayoutList } from "lucide-react"
import { StatCard } from "./stat-card"
import { calculateSubjectProgress } from "@/lib/calculations"
import { SubjectWithRelations } from "@/lib/calculations/types"
import { memo, useMemo } from "react"

interface SubjectStatsProps {
  subject: SubjectWithRelations;
}

function SubjectStatsComponent({ subject }: SubjectStatsProps) {
  // Calculate progress using the universal calculation logic
  const progress = useMemo(() => 
    calculateSubjectProgress(subject), 
    [subject]
  );

  // Calculate completed chapters based on learning progress
  const completedChapters = useMemo(() => {
    return subject.chapters.filter(chapter => {
      const chapterTopics = chapter.topics.length;
      if (chapterTopics === 0) return false;
      const completedTopics = chapter.topics.filter(topic => topic.learningStatus).length;
      return completedTopics === chapterTopics;
    }).length;
  }, [subject.chapters]);

  return (
    <div className="grid gap-4 grid-cols-2">
      {/* Expected Marks */}
      <StatCard 
        label="Expected Marks"
        value={progress.expectedMarks}
        subValue={`/${subject.weightage}`}
        icon={Info}
        tooltipText="Based on your test performance"
        valueColor="text-red-500"
      />

      {/* Foundation Level */}
      <StatCard 
        label="Foundation Level"
        value={progress.foundationLevel}
        icon={GraduationCap}
        iconColor="text-orange-500"
        valueColor="text-orange-500"
        tooltipText="Based on your overall progress with emphasis on learning phase"
      />

      {/* Topics Completed */}
      <StatCard 
        label="Topics Completed"
        value={`${progress.stats.learning.completedTopics}/${progress.stats.learning.totalTopics}`}
        icon={BookOpen}
        iconColor="text-blue-500"
        valueColor="text-blue-500"
        tooltipText="Number of topics completed in learning phase"
      />

      {/* Chapters Completed */}
      <StatCard 
        label="Chapters Completed"
        value={`${completedChapters}/${subject.chapters.length}`}
        icon={LayoutList}
        iconColor="text-green-500"
        valueColor="text-green-500"
        tooltipText="Chapters where all topics are completed in learning phase"
      />
    </div>
  );
}

export const SubjectStats = memo(SubjectStatsComponent); 