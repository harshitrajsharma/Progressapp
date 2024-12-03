import { Trash2, AlertCircle, Plus, MoreVertical, Pencil, GripVertical, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChapterCategory } from "./chapter-categories"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { EditChapterDialog } from "./edit-chapter-dialog"
import { AddTopicInput } from "./add-topic-input"
import { calculateChapterProgress } from "@/lib/calculations"
import { useMemo, memo, useState, useCallback, useEffect } from "react"
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useTopicReorder } from "@/hooks/use-topic-reorder"
import { TopicActions } from "./topic-actions"
import { TopicCheckboxes } from "./topic-checkboxes"
import { useChapterCollapse } from "@/hooks/use-chapter-collapse"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TopicUpdateData {
  name?: string;
  important?: boolean;
  position?: number;
}

interface Topic {
  id: string;
  name: string;
  important: boolean;
  learningStatus: boolean;
  revisionCount: number;
  practiceCount: number;
  testCount: number;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  lastRevised: Date | null;
  nextRevision: Date | null;
}

interface ChapterCardProps {
  id: string;
  name: string;
  topics: Topic[];
  progress: number;
  category: ChapterCategory;
  important?: boolean;
  onTopicToggle: (topicId: string, checkboxIndex?: number) => void;
  onEdit?: (chapterId: string, updatedChapter: { name: string; important: boolean }) => void;
  onDelete?: () => void;
  onAddTopic?: (chapterId: string, topic: { id: string; name: string }) => void;
  onUpdateTopic?: (chapterId: string, topicId: string, data: TopicUpdateData) => Promise<void>;
  onDeleteTopic?: (chapterId: string, topicId: string) => void;
  isPending?: (topicId: string) => boolean;
}

// Utility function for category-specific badge styles
const getCategoryBadgeStyle = (category: ChapterCategory) => {
  switch (category) {
    case 'learning': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
    case 'revision': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    case 'practice': return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
    case 'test': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
    default: return '';
  }
};

// Sortable Topic Item Component
const SortableTopicItem = memo(({ 
  topic, 
  category,
  onTopicToggle,
  onUpdateTopic,
  onDeleteTopic,
  isPending
}: {
  topic: Topic;
  category: ChapterCategory;
  onTopicToggle: (topicId: string, checkboxIndex?: number) => void;
  onUpdateTopic: (topicId: string, data: TopicUpdateData) => Promise<void>;
  onDeleteTopic: (topicId: string) => void;
  isPending?: (topicId: string) => boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Memoize completion status to prevent recalculation on every render
  const isCompleted = useMemo(() => {
    return category === 'learning' 
      ? topic.learningStatus
      : category === 'revision'
      ? topic.revisionCount === 3
      : category === 'practice'
      ? topic.practiceCount === 3
      : topic.testCount === 3;
  }, [
    category,
    topic.learningStatus,
    topic.revisionCount,
    topic.practiceCount,
    topic.testCount
  ]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "flex items-center gap-3 group",
        isDragging && "opacity-50"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 cursor-grab active:cursor-grabbing"
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </Button>

      <TopicCheckboxes 
        topic={topic} 
        category={category} 
        onTopicToggle={onTopicToggle}
        isPending={isPending}
      />
      <div className="flex items-center gap-2 flex-1">
        <label
          htmlFor={`${topic.id}-${category}`}
          className={cn(
            "text-sm flex-1",
            isCompleted && "line-through"
          )}
        >
          {topic.name}
        </label>
      </div>
      <TopicActions
        topicId={topic.id}
        topicName={topic.name}
        isImportant={topic.important}
        onUpdate={onUpdateTopic}
        onDelete={onDeleteTopic}
      />
    </div>
  );
});

SortableTopicItem.displayName = 'SortableTopicItem';

export function ChapterCard({ 
  id,
  name, 
  topics, 
  category,
  important = false,
  onTopicToggle,
  onEdit,
  onDelete,
  onAddTopic,
  onUpdateTopic,
  onDeleteTopic,
  isPending
}: ChapterCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [localTopics, setLocalTopics] = useState<Topic[]>(topics);
  const { handleReorder } = useTopicReorder(id);
  const { isCollapsed, toggleCollapse } = useChapterCollapse(id);

  // Update local topics when props change
  useEffect(() => {
    setLocalTopics(topics);
  }, [topics]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localTopics.findIndex((t) => t.id === active.id);
    const newIndex = localTopics.findIndex((t) => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      // Optimistically update the local state
      setLocalTopics(prevTopics => {
        const newTopics = arrayMove(prevTopics, oldIndex, newIndex);
        return newTopics.map((topic: Topic, index: number) => ({
          ...topic,
          position: index
        }));
      });

      // Call the API and update parent state
      const updatedTopics = await handleReorder(oldIndex, newIndex, localTopics);
      if (!updatedTopics) {
        // Revert to original state if the API call failed
        setLocalTopics(topics);
      }
    }
  };

  // Calculate chapter progress using the universal calculation logic
  const chapterProgress = useMemo(() => {
    return calculateChapterProgress({
      id,
      name,
      important,
      subjectId: 'dummy-id',
      overallProgress: 0,
      learningProgress: 0,
      revisionProgress: 0,
      practiceProgress: 0,
      testProgress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      topics: topics.map(topic => ({ ...topic, chapterId: id })),
      subject: { 
        id: '', 
        name: '', 
        userId: '',
        overallProgress: 0,
        learningProgress: 0,
        revisionProgress: 0,
        practiceProgress: 0,
        testProgress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        position: 0,
        weightage: 0,
        expectedMarks: 0,
        foundationLevel: 'BEGINNER'
      }
    });
  }, [id, name, topics, important]);

  // Get the progress value for the current category
  const categoryProgress = useMemo(() => {
    return Math.round(chapterProgress[category]);
  }, [chapterProgress, category]);

  const handleEdit = useCallback((updatedChapter: { id: string; name: string; important: boolean }) => {
    if (onEdit) {
      onEdit(id, {
        name: updatedChapter.name,
        important: updatedChapter.important
      });
    }
  }, [id, onEdit]);

  const handleAddTopic = useCallback((topic: { id: string; name: string }) => {
    if (onAddTopic) {
      onAddTopic(id, topic);
    }
    setIsAddingTopic(false);
  }, [id, onAddTopic]);

  const handleTopicUpdate = useCallback(async (topicId: string, data: TopicUpdateData) => {
    if (onUpdateTopic) {
      return onUpdateTopic(id, topicId, data);
    }
  }, [id, onUpdateTopic]);

  const handleTopicDelete = useCallback((topicId: string) => {
    onDeleteTopic?.(id, topicId);
  }, [id, onDeleteTopic]);

  const handleDeleteChapter = useCallback(() => {
    onDelete?.();
    setShowDeleteDialog(false);
  }, [onDelete]);

  return (
    <div className="space-y-4 p-4 rounded-lg border-2">
      <div className="flex items-start justify-between">
        <div 
          className="flex-1 cursor-pointer select-none min-w-0"
          onClick={toggleCollapse}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <ChevronDown className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-200",
                !isCollapsed && "rotate-180"
              )} />
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-medium truncate">{name}</h3>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-6 sm:ml-0 flex-shrink-0">
              <Badge 
                variant="secondary" 
                className={cn("font-medium shrink-0", getCategoryBadgeStyle(category))}
              >
                {categoryProgress}%
              </Badge>
              {important && (
                <Badge 
                  variant="outline" 
                  className="border-red-200 text-red-700 dark:border-red-800 dark:text-red-300 shrink-0"
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Important
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsAddingTopic(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowEditDialog(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="sm:hidden flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsAddingTopic(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Topic
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Chapter
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Chapter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isAddingTopic && (
        <AddTopicInput
          chapterId={id}
          onAddTopic={handleAddTopic}
          onClose={() => setIsAddingTopic(false)}
        />
      )}

      {!isCollapsed && (
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localTopics.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className={cn(
              "space-y-3 transition-all duration-200",
              isCollapsed ? "h-0 opacity-0" : "opacity-100"
            )}>
              {localTopics.map(topic => (
                <SortableTopicItem
                  key={topic.id}
                  topic={topic}
                  category={category}
                  onTopicToggle={onTopicToggle}
                  onUpdateTopic={handleTopicUpdate}
                  onDeleteTopic={handleTopicDelete}
                  isPending={isPending}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <EditChapterDialog
        chapterId={id}
        initialName={name}
        initialImportant={important}
        onSuccess={handleEdit}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{name}&rdquo;? This action cannot be undone.
              All topics and progress in this chapter will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChapter}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Chapter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 