'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { SubjectWithRelations } from "@/lib/calculations/types";
import { useToast } from "@/hooks/use-toast";
import { useSubjects } from "@/hooks/use-subjects";

interface EditSubjectDialogProps {
  subject: SubjectWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSubjectDialog({ subject, open, onOpenChange }: EditSubjectDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { revalidateSubjects } = useSubjects();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name') as string,
      weightage: Number(formData.get('weightage')),
    };

    try {
      const response = await fetch(`/api/subjects/${subject.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update subject');
      }

      toast({
        description: (
          <div className="flex gap-2 items-center">
            <Check className="h-4 w-4 text-green-500" />
            <span>Subject updated successfully</span>
          </div>
        ),
        variant: "default",
        className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
        duration: 3000,
      });

      // Revalidate data before closing dialog
      await revalidateSubjects();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating subject:', error);
      toast({
        description: (
          <div className="flex gap-2 items-center">
            <AlertCircle className="h-4 w-4" />
            <span>{error instanceof Error ? error.message : "Failed to update subject"}</span>
          </div>
        ),
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
          <DialogDescription>
            Make changes to your subject
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Subject Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={subject.name}
              placeholder="e.g. Operating Systems"
              required
              disabled={isLoading}
              className="bg-background"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="weightage">Weightage (%)</Label>
            <Input
              id="weightage"
              name="weightage"
              type="number"
              min="0"
              max="100"
              defaultValue={subject.weightage}
              placeholder="e.g. 15"
              required
              disabled={isLoading}
              className="bg-background"
            />
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Saving...</span>
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 