'use client';

import React, { useState, useEffect } from 'react';
import { User } from 'next-auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  GraduationCap,
  CheckCircle2,
  Pencil,
  X,
  Loader2,
  Timer
} from "lucide-react";

interface UserDetails {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  emailVerified: Date | null;
  examName: string | null;
  examDate: Date | null;
  createdAt: Date;
  stats: {
    totalStudyHours: number;
    avgDailyStudyMinutes: number;
    avgDailyTopics: number;
    avgDailyTests: number;
    completionRate: number;
    streakDays: number;
    totalMilestones: number;
    achievedMilestones: number;
  };
}

interface ProfileSectionProps {
  user: User & {
    id: string;
    examName?: string | null;
    examDate?: Date | null;
  };
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // First try to get cached data
        const cachedData = localStorage.getItem('userDetails');
        if (cachedData) {
          setUserDetails(JSON.parse(cachedData));
          setIsLoading(false);
        }

        // Then fetch fresh data
        const response = await fetch('/api/user/details');
        if (!response.ok) throw new Error('Failed to fetch user details');
        const data = await response.json();

        // Update state and cache
        setUserDetails(data);
        localStorage.setItem('userDetails', JSON.stringify(data));
      } catch (error) {
        console.error('Failed to load user details:', error);
        toast.error('Failed to load user details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();

    // Set up auto-refresh interval
    const refreshInterval = setInterval(fetchUserDetails, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      // Refresh user details after update
      const detailsResponse = await fetch('/api/user/details');
      if (detailsResponse.ok) {
        const data = await detailsResponse.json();
        setUserDetails(data);
        localStorage.setItem('userDetails', JSON.stringify(data));
      }

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </div>
          <Skeleton className="h-8 w-32 sm:w-40" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback>
                {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {isEditing ? (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-9 w-full sm:w-[250px]"
                    placeholder="Enter your name"
                  />
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      onClick={handleUpdateProfile}
                      disabled={isSaving || !name.trim()}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(false);
                        setName(user.name || '');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold truncate">{user.name}</h2>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            <p className="text-muted-foreground truncate">{user.email}</p>
            <div className="flex flex-wrap items-center gap-2">
              {userDetails?.emailVerified && (
                <Badge variant="secondary">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verified Account
                </Badge>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined {userDetails?.createdAt ? format(new Date(userDetails.createdAt), 'MMMM yyyy') : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground sm:flex-col sm:items-end">
          {userDetails?.examName && (
            <Badge variant="outline" className="text-sm">
              <GraduationCap className="mr-1 h-3 w-3" />
              Preparing for {userDetails.examName}
            </Badge>
          )}
          {userDetails?.examDate && (
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span>
                Exam on {format(new Date(userDetails.examDate), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}