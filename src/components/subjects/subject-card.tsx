'use client';

import { memo, useState, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { calculateSubjectProgress } from "@/lib/calculations";
import type { SubjectWithRelations } from "@/lib/calculations/types";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Check, AlertCircle, Book, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditSubjectDialog } from "@/components/subjects/edit-subject-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { useSubjects } from "@/hooks/use-subjects";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type SubjectCategory = 'not-started' | 'in-progress' | 'completed';

interface SubjectCardProps {
  subject: SubjectWithRelations;
  category?: SubjectCategory;
}

function SubjectCardComponent({ subject, category = 'not-started' }: SubjectCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();
  const { revalidateSubjects } = useSubjects();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subject.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 0.2s ease',
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 50 : isHovered ? 10 : 0,
  };

  const totalTopics = subject.chapters.reduce(
    (acc, chapter) => acc + chapter.topics.length,
    0
  );

  const progress = calculateSubjectProgress(subject);
  const learningProgress = Math.round(progress.learning);
  const revisionProgress = Math.round(progress.revision);
  const practiceProgress = Math.round(progress.practice);
  const testProgress = Math.round(progress.test);
  const overallProgress = Math.round(progress.overall);
  const foundationLevel = progress.foundationLevel;

  // Foundation level color mapping
  const getFoundationLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'text-violet-500';
      case 'moderate': return 'text-orange-500';
      case 'advanced': return 'text-rose-500';
      default: return 'text-zinc-500';
    }
  };
  
  // Foundation level BG color mapping
  const getFoundationLevelBG = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-violet-500';
      case 'moderate': return 'bg-orange-500';
      case 'advanced': return 'bg-rose-500';
      default: return 'bg-zinc-500';
    }
  };

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

      if (!response.ok) throw new Error(await response.text());

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative transform-gpu transition-all duration-300",
        isHovered && "scale-[1.02]",
        isDragging && "ring-2 ring-primary shadow-lg cursor-grabbing",
        !isDragging && "cursor-grab"
      )}
    >
      <Link
        href={`/subjects/${subject.id}`}
        onClick={(e) => isDragging && e.preventDefault()}
        className="block"
      >
        <Card className={cn(
          "p-4 transition-all relative",
          categoryBg[category],
          isDragging && "shadow-xl"
        )}>
          {/* Action Buttons */}
          <div className="absolute top-3 right-3 z-20 flex gap-1.5 opacity-0 transform translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={handleEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-500"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Header Section */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-bold text-foreground leading-tight">{subject.name}</h2>
                <Badge
                  className={cn(
                    "px-2 py-1 text-xs font-medium",
                    categoryColors[category]
                  )}
                >
                  {learningProgress}%
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Book className="h-4 w-4" />
                    <span>{subject.chapters.length} chapters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Target className="h-4 w-4" />
                    <span>{totalTopics} topics</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs font-normal">
                  {subject.weightage} marks
                </Badge>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">

              <div className="relative bg-background dark:bg-background rounded-lg overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
                <div className="p-2.5">
                  <p className="text-xs text-muted-foreground tracking-wider uppercase">Weightage</p>
                  <p className="text-lg font-semibold mt-0.5 text-green-500">{subject.weightage} Marks</p>
                </div>
              </div>

              <div className="relative bg-background dark:bg-background rounded-lg overflow-hidden">
                <div className={cn("absolute left-0 top-0 bottom-0 w-1", getFoundationLevelBG(foundationLevel) )} />
                <div className="p-2.5">
                  <p className="text-xs text-muted-foreground tracking-wider uppercase">Foundation</p>
                  <p className={cn(
                    "text-lg font-semibold mt-0.5",
                    getFoundationLevelColor(foundationLevel)
                  )}>{foundationLevel}</p>
                </div>
              </div>

            </div>

            {/* Progress Section */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Overall Progress</span>
                  <span className="font-semibold">{overallProgress}%</span>
                </div>
                <Progress
                  value={overallProgress}
                  className="h-2 bg-secondary/50"
                  indicatorClassName="bg-white dark:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Learning", value: learningProgress, color: "bg-blue-500" },
                  { label: "Revision", value: revisionProgress, color: "bg-green-500" },
                  { label: "Practice", value: practiceProgress, color: "bg-amber-500" },
                  { label: "Test", value: testProgress, color: "bg-purple-500" }
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <Progress
                      value={item.value}
                      className="h-1.5 bg-secondary/50"
                      indicatorClassName={item.color}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </Link>

      <EditSubjectDialog
        subject={subject}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
      />

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