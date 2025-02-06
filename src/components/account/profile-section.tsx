'use client';

import { User } from 'next-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Calendar, Trophy, BookOpen, GraduationCap, Mail } from "lucide-react";

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
  const [name, setName] = useState(user.name || '');
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch('/api/user/details');
        if (!response.ok) throw new Error('Failed to fetch user details');
        const data = await response.json();
        setUserDetails(data);
      } catch (error) {
        console.error('Failed to load user details:', error);
        toast.error('Failed to load user details');
      } finally {
        setIsLoading(false);
      }

    };

    fetchUserDetails();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Manage your public profile information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || ''} alt={user.name || ''} />
              <AvatarFallback>{user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                {isEditing ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="max-w-sm"
                    />
                    <Button onClick={handleUpdateProfile}>Save</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-lg font-medium">{user.name}</p>
                    <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">{user.email}</p>
                  {userDetails?.emailVerified && (
                    <Badge variant="secondary" className="text-xs">
                      <Mail className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Join Date */}
          {isLoading ? (
            <Skeleton className="h-8 w-full" />
          ) : userDetails?.createdAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Joined on {format(new Date(userDetails.createdAt), 'MMMM d, yyyy')}</span>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))
            ) : userDetails?.stats && (
              <>
                <div className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Total Study Hours</span>
                  </div>
                  <p className="text-2xl font-bold">{userDetails.stats.totalStudyHours}</p>
                </div>
                
                <div className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Avg. Daily Topics</span>
                  </div>
                  <p className="text-2xl font-bold">{userDetails.stats.avgDailyTopics}</p>
                </div>
                
                <div className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Avg. Daily Tests</span>
                  </div>
                  <p className="text-2xl font-bold">{userDetails.stats.avgDailyTests}</p>
                </div>
                
                <div className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Daily Study Time</span>
                  </div>
                  <p className="text-2xl font-bold">{userDetails.stats.avgDailyStudyMinutes} min</p>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 