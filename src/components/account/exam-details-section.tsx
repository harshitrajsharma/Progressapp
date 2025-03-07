'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

interface ExamDetailsSectionProps {
  user: {
    id: string;
    examName?: string | null;
    examDate?: Date | null;
  };
}

export function ExamDetailsSection({ user }: ExamDetailsSectionProps) {
  const { data: session, update: updateSession } = useSession();
  const [examName, setExamName] = useState(user.examName || '');
  const [examDate, setExamDate] = useState<Date | undefined>(
    user.examDate ? new Date(user.examDate) : undefined
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when user prop changes
  useEffect(() => {
    setExamName(user.examName || '');
    setExamDate(user.examDate ? new Date(user.examDate) : undefined);
  }, [user]);

  const handleSave = async () => {
    if (!examName || !examDate) {
      toast.error('Please fill in exam name and date');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/exam-details', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examName,
          examDate: examDate.toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update exam details');
      }

      const updatedUser = await response.json();
      
      // Update the session with new user data
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          ...updatedUser,
        },
      });

      // Clear cached user details to force a refresh
      localStorage.removeItem('userDetails');
      
      toast.success('Exam details updated successfully');
      setIsEditing(false);

      // Trigger a page refresh to update all components
      window.location.reload();
    } catch (error) {
      console.error('Failed to update exam details:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update exam details');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Exam Details</h3>
              <p className="text-sm text-muted-foreground">
                Set your target exam and date
              </p>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                Edit Details
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="examName">Exam Name</Label>
                <Input
                  id="examName"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="Enter your target exam name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Exam Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !examDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {examDate ? format(examDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={examDate}
                      onSelect={setExamDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setExamName(user.examName || '');
                    setExamDate(user.examDate ? new Date(user.examDate) : undefined);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">Exam Name</Label>
                <p className="text-lg font-medium">{examName || 'Not set'}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">Exam Date</Label>
                <p className="text-lg font-medium">
                  {examDate ? format(examDate, "MMMM d, yyyy") : 'Not set'}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 