'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface TopicResponse {
  success: boolean;
  topic: {
    id: string;
    name: string;
    important: boolean;
    learningStatus: boolean;
    revisionCount: number;
    practiceCount: number;
    testCount: number;
    chapterId: string;
    position: number;
    lastRevised: string | null;
    nextRevision: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

interface TopicActionsProps {
  topicId: string;
  topicName: string;
  isImportant: boolean;
  onUpdate: (chapterId: string, topicId: string, data: { name?: string; important?: boolean }) => Promise<TopicResponse>;
  onDelete: (topicId: string) => void;
  chapterId: string;
}

export function TopicActions({ 
  topicId, 
  topicName, 
  isImportant,
  onUpdate,
  onDelete,
  chapterId 
}: TopicActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedName, setEditedName] = useState(topicName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Update local state when prop changes
  useEffect(() => {
    setEditedName(topicName || '');
  }, [topicName]);

  const handleImportantToggle = async () => {
    try {
      setIsSubmitting(true);
      await onUpdate(chapterId, topicId, { important: !isImportant });
    } catch (error) {
      console.error('Error toggling importance:', error);
      toast({
        title: "Error",
        description: "Failed to update topic importance.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    const trimmedName = editedName?.trim() || '';
    if (!trimmedName || trimmedName === topicName) {
      setShowEditDialog(false);
      setEditedName(topicName || '');
      return;
    }

    try {
      setIsSubmitting(true);
      await onUpdate(chapterId, topicId, { name: trimmedName });
      setShowEditDialog(false);
    } catch (error) {
      console.error('Error updating topic name:', error);
      toast({
        title: "Error",
        description: "Failed to update topic name.",
        variant: "destructive",
      });
      setEditedName(topicName || '');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await onDelete(topicId);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting topic:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-1 ml-auto">
      {/* Star button - always visible */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 transition-colors",
          isImportant ? "text-yellow-500 hover:text-yellow-600" : "opacity-0 group-hover:opacity-100"
        )}
        onClick={handleImportantToggle}
        disabled={isSubmitting}
      >
        <Star className={cn("h-4 w-4", isImportant && "fill-current")} />
      </Button>

      {/* Other action buttons - only visible on hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setEditedName(topicName || '');
              setShowEditDialog(true);
            }}
            disabled={isSubmitting}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Topic</DialogTitle>
              <DialogDescription>
                Make changes to your topic name.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  id="name"
                  placeholder="Enter topic name"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isSubmitting) {
                      e.preventDefault();
                      handleEditSubmit();
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditedName(topicName || '');
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSubmit}
                disabled={isSubmitting || !(editedName?.trim()) || editedName === topicName}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
              disabled={isSubmitting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Topic</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{topicName}"? This action cannot be undone.
                All progress for this topic will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
} 