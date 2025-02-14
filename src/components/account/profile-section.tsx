import React, { useState, useEffect } from 'react';
import { User } from 'next-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  Calendar, 
  Trophy, 
  BookOpen, 
  GraduationCap,
  UserCircle,
  Activity,
  Camera,
  CheckCircle2,
  LucideIcon
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

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  subValue: string;
  color: {
    bg: string;
    text: string;
  };
  trend?: {
    type: 'success' | 'warning' | 'error';
    value: string;
    description: string;
  } | null;
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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

  const StatCard: React.FC<StatCardProps> = ({ 
    icon: Icon, 
    label, 
    value, 
    subValue, 
    color, 
    trend 
  }) => (
    <div className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-br from-background to-muted opacity-50" />
      <div className="relative p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color.bg}`}>
              <Icon className={`h-5 w-5 ${color.text}`} />
            </div>
            <span className="font-medium text-sm text-muted-foreground">{label}</span>
          </div>
          {trend && (
            <Badge variant={trend.type === 'success' ? 'default' : trend.type === 'warning' ? 'secondary' : 'destructive'} className="text-xs">
              {trend.value}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold tracking-tight">
            {value}
            <span className="text-sm font-normal text-muted-foreground ml-1">{subValue}</span>
          </p>
          {trend && (
            <p className="text-sm text-muted-foreground">{trend.description}</p>
          )}
        </div>
      </div>
    </div>
  );


  const statsConfig: StatCardProps[] = [
    {
      icon: Clock,
      label: "Total Study Time",
      value: userDetails?.stats.totalStudyHours || 0,
      subValue: "hours",
      color: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
      trend: {
        type: 'success',
        value: '+2.5%',
        description: 'vs. last week'
      }
    },
    {
      icon: BookOpen,
      label: "Daily Topics Coverage",
      value: userDetails?.stats.avgDailyTopics || 0,
      subValue: "topics",
      color: { bg: 'bg-green-500/10', text: 'text-green-500' },
      trend: {
        type: 'success',
        value: '+4 topics',
        description: 'Average improvement'
      }
    },
    {
      icon: Trophy,
      label: "Study Streak",
      value: userDetails?.stats.streakDays || 0,
      subValue: "days",
      color: { bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
      trend: {
        type: 'success',
        value: 'Best yet!',
        description: 'Personal record'
      }
    },
    {
      icon: GraduationCap,
      label: "Daily Study Average",
      value: userDetails?.stats.avgDailyStudyMinutes || 0,
      subValue: "min",
      color: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
      trend: {
        type: 'warning',
        value: '-5 min',
        description: 'Room for improvement'
      }
    }
  ];

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader className="border-b bg-muted/40">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">Profile Dashboard</CardTitle>
              <CardDescription className="text-base">
                Track your progress and manage your learning journey
              </CardDescription>
            </div>
            {!isEditing && (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="shadow-sm"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs 
            defaultValue="overview" 
            className="space-y-8"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px] p-1">
              <TabsTrigger 
                value="overview"
                className={`${activeTab === 'overview' ? 'shadow-sm' : ''} transition-all`}
              >
                <UserCircle className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="statistics"
                className={`${activeTab === 'statistics' ? 'shadow-sm' : ''} transition-all`}
              >
                <Activity className="h-4 w-4 mr-2" />
                Statistics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Profile Section */}
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3 space-y-6">
                  <div className="relative group">
                    <Avatar className="h-32 w-32 border-2 border-muted mx-auto lg:mx-0">
                      <AvatarImage src={user.image || ''} alt={user.name || ''} />
                      <AvatarFallback className="text-3xl">{user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-1/2 lg:right-0 translate-x-1/2 lg:translate-x-0 -translate-y-2 bg-primary text-primary-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>

                  {!isLoading && userDetails?.createdAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {format(new Date(userDetails.createdAt), 'MMMM d, yyyy')}</span>
                    </div>
                  )}
                </div>

                <div className="lg:w-2/3 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="max-w-sm"
                          />
                          <Button onClick={handleUpdateProfile}>Save</Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </div>
                      ) : (
                        <p className="text-lg font-semibold">{user.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <div className="flex items-center gap-2">
                        <p className="text-muted-foreground">{user.email}</p>
                        {userDetails?.emailVerified && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-8">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-[180px]" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {statsConfig.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}