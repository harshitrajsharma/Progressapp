'use client';

import { memo, useState, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { calculateSubjectProgress } from "@/lib/calculations";
import type { SubjectWithRelations } from "@/lib/calculations/types";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditSubjectDialog } from "@/components/subjects/edit-subject-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { useSubjects } from "@/hooks/use-subjects";
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type SubjectCategory = 'not-started' | 'in-progress' | 'completed';

interface SubjectCardProps {
  subject: SubjectWithRelations;
  category?: SubjectCategory;
}

function SubjectCardComponent({ subject, category = 'not-started' }: SubjectCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { revalidateSubjects } = useSubjects();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subject.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 50 : 0,
  }

  const totalTopics = subject.chapters.reduce(
    (acc, chapter) => acc + chapter.topics.length,
    0
  );

  // Use centralized calculation logic
  const progress = calculateSubjectProgress(subject);
  const learningProgress = Math.round(progress.learning);
  const revisionProgress = Math.round(progress.revision);
  const practiceProgress = Math.round(progress.practice);
  const testProgress = Math.round(progress.test);
  const overallProgress = Math.round(progress.overall);
  
 
  const foundationLevel = progress.foundationLevel;

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/subjects/${subject.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          description: (
            <div className="flex gap-2 items-center">
              <Check className="h-4 w-4 text-green-500" />
              <span>Subject deleted successfully</span>
            </div>
          ),
          variant: "default",
          className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
          duration: 3000,
        });

        setDeleteDialogOpen(false);
        await revalidateSubjects();
      } else {
        let errorMessage = 'Failed to delete subject';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast({
        description: (
          <div className="flex gap-2 items-center">
            <AlertCircle className="h-4 w-4" />
            <span>{error instanceof Error ? error.message : "Failed to delete subject"}</span>
          </div>
        ),
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  }, [subject.id, toast, revalidateSubjects]);

  const handleEditSuccess = useCallback(() => {
    setEditDialogOpen(false);
    revalidateSubjects();
  }, [revalidateSubjects]);

  const categoryColors = {
    'not-started': 'bg-red-500/10 text-red-500',
    'in-progress': 'bg-blue-500/10 text-blue-500',
    'completed': 'bg-green-500/10 text-green-500'
  } as const;

  const categoryBg = {
    'not-started': 'hover:bg-red-500/10 bg-red-500/[0.03]',
    'in-progress': 'hover:bg-blue-500/10 bg-blue-500/[0.03]',
    'completed': 'hover:bg-green-500/10 bg-green-500/[0.03]'
  } as const;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative hover:scale-105 transition-all duration-1000 ",
        isDragging && "ring-2 ring-primary shadow-lg cursor-grabbing",
        !isDragging && "cursor-grab"
      )}
    >
      <Link 
        href={`/subjects/${subject.id}`}
        onClick={(e) => {
          if (isDragging) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
      >
        <Card className={cn(
          "p-3 sm:p-4 hover:shadow-md transition-all relative",
          categoryBg[category],
          isDragging && "shadow-xl"
        )}>
          {/* Action Buttons - Show on hover */}
          <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 bg-white dark:bg-background border text-muted-foreground hover:text-foreground"
                onClick={handleEdit}
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 bg-white dark:bg-background border text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* Header */}
            <div className="space-y-2 sm:space-y-3">
              {/* Subject Name and Progress Badge */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">{subject.name}</h2>
                <Badge 
                  className={cn(
                    "text-xs font-medium px-1.5 sm:px-2 py-0.5",
                    categoryColors[category]
                  )}
                >
                  {learningProgress}%
                </Badge>
              </div>
              
              {/* Subject Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                  <span>{subject.chapters.length} chapters</span>
                  <span>•</span>
                  <span>{totalTopics} topics</span>
                </div>
                <Badge variant="secondary" className=" text-[10px] sm:text-xs font-normal">
                  {subject.weightage} marks
                </Badge>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Subject Weightage */}
              <div className="relative bg-background dark:bg-background rounded-lg sm:rounded-xl overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 sm:w-1 bg-green-500" />
                <div className="p-2 sm:p-2.5">
                  <p className="text-[10px] sm:text-xs text-muted-foreground tracking-wider uppercase">subject weightage </p>
                  <p className="text-base sm:text-lg font-semibold text-green-500 mt-0.5">
                    {subject.weightage} Marks
                  </p>
                </div>
              </div>

              {/* Foundation Level */}
              <div className="relative bg-background dark:bg-background rounded-lg sm:rounded-xl overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 sm:w-1 bg-orange-500" />
                <div className="p-2 sm:p-2.5">
                  <p className="text-[10px] sm:text-xs text-muted-foreground tracking-wider uppercase">Foundation</p>
                  <p className="text-base sm:text-lg font-semibold text-orange-500 mt-0.5">
                    {foundationLevel}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-2 sm:space-y-3">
              {/* Overall Progress */}
              <div className="space-y-1 sm:space-y-1.5">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium">{overallProgress}%</span>
                </div>
                <Progress 
                  value={overallProgress} 
                  className="h-1.5 sm:h-2 bg-secondary/50 dark:bg-secondary/25" 
                  indicatorClassName="bg-primary"
                />
              </div>

              {/* Detailed Progress */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="space-y-0.5 sm:space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Learning</span>
                    <span>{learningProgress}%</span>
                  </div>
                  <Progress 
                    value={learningProgress} 
                    className="h-1 sm:h-1.5 bg-secondary/50 dark:bg-secondary/25" 
                    indicatorClassName="bg-blue-500"
                  />
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Revision</span>
                    <span>{revisionProgress}%</span>
                  </div>
                  <Progress 
                    value={revisionProgress} 
                    className="h-1 sm:h-1.5 bg-secondary/50 dark:bg-secondary/25" 
                    indicatorClassName="bg-green-500"
                  />
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Practice</span>
                    <span>{practiceProgress}%</span>
                  </div>
                  <Progress 
                    value={practiceProgress} 
                    className="h-1 sm:h-1.5 bg-secondary/50 dark:bg-secondary/25" 
                    indicatorClassName="bg-yellow-500"
                  />
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Test</span>
                    <span>{testProgress}%</span>
                  </div>
                  <Progress 
                    value={testProgress} 
                    className="h-1 sm:h-1.5 bg-secondary/50 dark:bg-secondary/25" 
                    indicatorClassName="bg-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>

      {/* Edit Dialog */}
      <EditSubjectDialog 
        subject={subject}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Subject"
        description={`Are you sure you want to delete ${subject.name}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}

export const SubjectCard = memo(SubjectCardComponent); 