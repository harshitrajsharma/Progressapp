import { Trash2, AlertCircle, Plus, MoreVertical, Pencil, GripVertical, ChevronDown, Loader2, Star, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChapterCategory } from "@/types/prisma/category"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { EditChapterDialogWrapper } from "./edit-chapter-dialog-wrapper"
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
import { TopicCheckboxes } from "./topic-checkboxes"
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
import { useChapterCollapse } from "@/hooks/use-chapter-collapse"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BaseTopic, TopicUpdateData, TopicResponse } from "@/types/prisma/topic"
import { BaseChapter } from "@/types/prisma/chapter"
import { convertDates } from "@/lib/utils/dates"
import { Topic } from "@prisma/client"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TopicActions } from "./topic-actions"
import { Input } from "@/components/ui/input"

interface ChapterCardProps {
  id: string;
  name: string;
  topics: BaseTopic[];
  progress: number;
  category: ChapterCategory;
  important?: boolean;
  onTopicToggle: (topicId: string, checkboxIndex?: number) => void;
  onEdit?: (chapterId: string, updatedChapter: { name: string; important: boolean }) => void;
  onDelete?: () => Promise<void>;
  onAddTopic?: (chapterId: string, topic: { id: string; name: string }) => void;
  onUpdateTopic?: (chapterId: string, topicId: string, data: TopicUpdateData) => Promise<TopicResponse>;
  onDeleteTopic?: (chapterId: string, topicId: string) => void;
  isPending?: (topicId: string) => boolean;
}

const getCategoryBadgeStyle = (category: ChapterCategory) => {
  switch (category) {
    case 'learning': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200 hover:bg-blue-200';
    case 'revision': return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-200 hover:bg-green-200';
    case 'practice': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200 hover:bg-amber-200';
    case 'test': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-200 hover:bg-purple-200';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-200';
  }
};

const SortableTopicItem = memo(({ 
  topic, 
  category,
  onTopicToggle,
  onUpdateTopic,
  onDeleteTopic,
  isPending,
  chapterId
}: {
  topic: BaseTopic;
  category: ChapterCategory;
  onTopicToggle: (topicId: string, checkboxIndex?: number) => void;
  onUpdateTopic: (chapterId: string, topicId: string, data: TopicUpdateData) => Promise<TopicResponse>;
  onDeleteTopic: (topicId: string) => void;
  isPending?: (topicId: string) => boolean;
  chapterId: string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id });

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(topic.name);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: `${transition}, opacity 150ms ease`,
  };

  const isCompleted = useMemo(() => {
    return category === 'learning' 
      ? topic.learningStatus
      : category === 'revision'
      ? topic.revisionCount === 3
      : category === 'practice'
      ? topic.practiceCount === 3
      : topic.testCount === 3;
  }, [category, topic]);

  const handleEditSubmit = async () => {
    if (newName.trim() && newName !== topic.name) {
      await onUpdateTopic?.(chapterId, topic.id, { name: newName, important: topic.important });
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "flex items-center gap-2 group bg-muted/50 hover:bg-muted rounded-lg p-2 shadow-sm transition-all duration-200",
        isDragging && "opacity-60 shadow-md bg-muted/70"
      )}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 cursor-grab text-muted-foreground hover:text-foreground"
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Drag to reorder</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TopicCheckboxes 
        topic={topic} 
        category={category} 
        onTopicToggle={onTopicToggle}
        isPending={isPending}
      />

      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit()}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditSubmit}
            className="h-8 w-8"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <label
            htmlFor={`${topic.id}-${category}`}
            className={cn(
              "text-sm font-medium text-foreground truncate flex-1",
              isCompleted && "line-through text-muted-foreground"
            )}
          >
            {topic.name}
          </label>
          {topic.important && (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 md:hidden" />
          )}
        </div>
      )}

      {/* Desktop: Inline TopicActions */}
      <div className="hidden md:flex">
        <TopicActions
          topicId={topic.id}
          topicName={topic.name}
          isImportant={topic.important}
          onUpdate={onUpdateTopic}
          onDelete={onDeleteTopic}
          chapterId={chapterId}
        />
      </div>

      {/* Mobile: Dropdown Menu */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => onUpdateTopic?.(chapterId, topic.id, { name: topic.name, important: !topic.important })}
            >
              <Star className="h-4 w-4 mr-2" />
              {topic.important ? "Unmark Priority" : "Mark as Priority"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Topic Name
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteTopic?.(topic.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Topic
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});

SortableTopicItem.displayName = 'SortableTopicItem';

const mockSubject = {
  id: '',
  name: '',
  weightage: 0,
  expectedMarks: 0,
  foundationLevel: 'Beginner' as const,
  overallProgress: 0,
  learningProgress: 0,
  revisionProgress: 0,
  practiceProgress: 0,
  testProgress: 0,
  position: 0,
  userId: '',
  createdAt: new Date(),
  updatedAt: new Date()
};

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [localTopics, setLocalTopics] = useState<BaseTopic[]>(topics);
  const { handleReorder } = useTopicReorder(id);
  const { isCollapsed, toggleCollapse } = useChapterCollapse(id);

  useEffect(() => {
    setLocalTopics(topics);
  }, [topics]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localTopics.findIndex((t) => t.id === active.id);
    const newIndex = localTopics.findIndex((t) => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newTopics = arrayMove(localTopics, oldIndex, newIndex);
      const updatedTopics = newTopics.map((topic, index) => ({
        ...topic,
        position: index
      }));

      setLocalTopics(updatedTopics);
      const serverTopics = await handleReorder(oldIndex, newIndex, localTopics);
      setLocalTopics(serverTopics || topics);
    }
  };

  const chapterProgress = useMemo(() => {
    const chapterData: BaseChapter = {
      id, name, important: false, learningProgress: 0, revisionProgress: 0,
      practiceProgress: 0, testProgress: 0, overallProgress: 0, position: 0,
      subjectId: '', createdAt: new Date(), updatedAt: new Date()
    };
    const topicsWithDates = topics.map(topic => 
      convertDates({ ...topic }, ['lastRevised', 'nextRevision', 'createdAt', 'updatedAt']) as Topic
    );
    return calculateChapterProgress({ ...chapterData, topics: topicsWithDates, subject: mockSubject });
  }, [id, name, topics]);

  const categoryProgress = useMemo(() => {
    const progress = Math.round(chapterProgress[category]);
    return Number.isFinite(progress) ? progress : 0;
  }, [chapterProgress, category]);

  const handleEdit = useCallback((updatedChapter: { id: string; name: string; important: boolean }) => {
    onEdit?.(id, { name: updatedChapter.name, important: updatedChapter.important });
  }, [id, onEdit]);

  const handleAddTopic = useCallback((topic: { id: string; name: string }) => {
    onAddTopic?.(id, topic);
  }, [id, onAddTopic]);

  const handleDeleteChapter = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onDelete?.();
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  }, [onDelete]);

  return (
    <div className="space-y-4 p-4 sm:p-5 bg-card rounded-xl border shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <div 
          className="flex-1 cursor-pointer select-none min-w-0"
          onClick={toggleCollapse}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <ChevronDown className={cn(
              "h-5 w-5 text-muted-foreground transition-transform duration-300 ease-in-out",
              !isCollapsed && "rotate-180"
            )} />
            <h3 className="text-base sm:text-lg font-semibold text-foreground truncate flex-1">{name}</h3>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <Badge 
                variant="secondary" 
                className={cn(
                  "font-medium px-1.5 sm:px-2 py-0.5 text-xs sm:text-sm transition-colors duration-200",
                  getCategoryBadgeStyle(category)
                )}
              >
                {categoryProgress}%
              </Badge>
              {important && (
                <Badge 
                  variant="outline" 
                  className="border-red-200 text-red-600 dark:border-red-800 dark:text-red-400 px-1.5 sm:px-2 py-0.5 text-xs sm:text-sm"
                >
                  <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                  Priority
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 text-muted-foreground hover:text-green-600"
                  onClick={() => setIsAddingTopic(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Topic</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 text-muted-foreground hover:text-yellow-600"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Chapter</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 text-muted-foreground hover:text-red-600"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Chapter</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="sm:hidden flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsAddingTopic(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Topic
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Pencil className="h-4 w-4 mr-2" /> Edit Chapter
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete Chapter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isAddingTopic && (
        <div className="animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <AddTopicInput
            chapterId={id}
            onAddTopic={handleAddTopic}
            onClose={() => setIsAddingTopic(false)}
          />
        </div>
      )}

      {!isCollapsed && (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={localTopics.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 mt-2 animate-in fade-in-0 slide-in-from-top-4 duration-300">
              {localTopics.map(topic => (
                <SortableTopicItem
                  key={topic.id}
                  topic={topic}
                  category={category}
                  onTopicToggle={onTopicToggle}
                  onUpdateTopic={onUpdateTopic!}
                  onDeleteTopic={(topicId) => onDeleteTopic!(id, topicId)}
                  isPending={isPending}
                  chapterId={id}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <EditChapterDialogWrapper
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
              Are you sure you want to delete &quot;{name}&quot;? This will remove all associated topics and progress permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChapter}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Confirm Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}