'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from 'react';
import { toast } from 'sonner';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

export function ExamDetailsSection() {
  const { data: session, update: updateSession } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [examName, setExamName] = useState(session?.user?.examName || '');
  const [examDate, setExamDate] = useState<Date | undefined>(
    session?.user?.examDate ? new Date(session.user.examDate) : undefined
  );

  const handleUpdateExamDetails = async () => {
    try {
      const response = await fetch('/api/user/exam-details', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examName, examDate }),
      });

      if (!response.ok) throw new Error('Failed to update exam details');
      
      await updateSession({ examName, examDate });
      toast.success('Exam details updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update exam details:', error);
      toast.error('Failed to update exam details');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exam Details</CardTitle>
        <CardDescription>
          Update your exam information and target date.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Exam Name</label>
            {isEditing ? (
              <Input
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="mt-1"
                placeholder="Enter your exam name"
              />
            ) : (
              <p className="mt-1 text-lg">{session?.user?.examName || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Exam Date</label>
            {isEditing ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !examDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {examDate ? format(examDate, "PPP") : <span>Pick a date</span>}
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
            ) : (
              <p className="mt-1 text-lg">
                {session?.user?.examDate 
                  ? format(new Date(session.user.examDate), "PPP")
                  : 'Not set'}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {isEditing ? (
              <>
                <Button onClick={handleUpdateExamDetails}>Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Details</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 