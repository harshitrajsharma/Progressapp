'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Plus, Check, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSubjects } from "@/hooks/use-subjects";

export function AddSubjectButton() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { revalidateSubjects } = useSubjects();
  const { data: session } = useSession();
  const [userData, setUserData] = useState<{ examName: string | null }>();

  // Fetch user data including exam name
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/user/details');
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
    fetchUserData();
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name') as string,
      weightage: Number(formData.get('weightage')),
      foundationLevel: "Beginner" // Default value
    };

    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === "Validation error") {
          const errorMessage = result.details
            .map((detail: { field: string; message: string }) => `${detail.field}: ${detail.message}`)
            .join(', ');
          throw new Error(errorMessage);
        }
        throw new Error(result.message || 'Failed to create subject');
      }

      toast({
        description: (
          <div className="flex gap-2 items-center">
            <Check className="h-4 w-4 text-green-500" />
            <span>Subject created successfully</span>
          </div>
        ),
        variant: "default",
        className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
        duration: 3000,
      });

      // Revalidate data before closing dialog
      await revalidateSubjects();
      setOpen(false);
    } catch (error) {
      console.error('Error creating subject:', error);
      toast({
        description: (
          <div className="flex gap-2 items-center">
            <AlertCircle className="h-4 w-4" />
            <span>{error instanceof Error ? error.message : "Failed to create subject"}</span>
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
    <Dialog open={open} onOpenChange={isLoading ? undefined : setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
          <DialogDescription>
            Add a new subject to track your {userData?.examName || "exam"} preparation
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Subject Name</Label>
            <Input
              id="name"
              name="name"
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
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Adding...</span>
                </div>
              ) : (
                "Add Subject"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 