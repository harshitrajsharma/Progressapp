'use client';

import { User } from 'next-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from 'react';
import { toast } from 'sonner';

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
        <div className="flex items-center space-x-4">
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
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="mt-1">{user.email}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 