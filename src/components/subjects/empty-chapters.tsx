import { Card } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import { AddChapterDialog } from "./add-chapter-dialog"
import { ChapterWithRelations } from "@/lib/calculations/types"
import { useCallback } from "react"

interface EmptyChaptersProps {
  subjectId: string;
  onSuccess?: (newChapter: ChapterWithRelations) => void;
}

export function EmptyChapters({ subjectId, onSuccess }: EmptyChaptersProps) {
  const handleChapterCreated = useCallback((newChapter: ChapterWithRelations) => {
    if (onSuccess) {
      onSuccess(newChapter);
    }
  }, [onSuccess]);

  return (
    <Card className="p-8 flex flex-col items-center justify-center space-y-4">
      <BookOpen className="h-12 w-12 text-muted-foreground" />
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">
          No chapters added yet. Start by adding your first chapter!
        </p>
      </div>
      <AddChapterDialog 
        subjectId={subjectId}
        onSuccess={handleChapterCreated}
      />
    </Card>
  )
} 