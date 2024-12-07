'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

interface StudyProgressProps {
    dailyGoal: number;
    totalStudyTime: number;
    currentStreak: number;
    yesterdayTime: number;
    onDailyGoalChange: (hours: number) => void;
}

export function StudyProgress({
    dailyGoal,
    totalStudyTime,
    currentStreak,
    yesterdayTime,
    onDailyGoalChange
}: StudyProgressProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [includeWeekends, setIncludeWeekends] = useState(false);
    const [tempDailyGoal, setTempDailyGoal] = useState(dailyGoal);

    // Calculate progress percentage
    const progressPercentage = Math.min(100, (totalStudyTime / (dailyGoal * 60)) * 100);
    const completedHours = Math.floor(totalStudyTime / 60);
    const completedMinutes = totalStudyTime % 60;
    
    // Check if daily goal is met
    const isDailyGoalMet = totalStudyTime >= dailyGoal * 60;
    const wasYesterdayGoalMet = yesterdayTime >= dailyGoal * 60;

    // Calculate streak status
    const getStreakStatus = () => {
        if (isDailyGoalMet) {
            return "active";
        } else if (wasYesterdayGoalMet && currentStreak > 0) {
            return "pending"; // Still has chance to maintain streak today
        }
        return "broken";
    };

    const streakStatus = getStreakStatus();

    // Format the streak display
    const getStreakDisplay = () => {
        if (!wasYesterdayGoalMet && !isDailyGoalMet) {
            return {
                value: 0, // Reset to 0 if yesterday's goal wasn't met
                color: "text-muted-foreground"
            };
        }
        return {
            value: currentStreak,
            color: streakStatus === "active" ? "text-emerald-500" : 
                   streakStatus === "pending" ? "text-yellow-500" : 
                   "text-muted-foreground"
        };
    };

    const streakDisplay = getStreakDisplay();

    // Calculate the circumference of the circle (2πr where r is 45% of viewBox)
    const circumference = 2 * Math.PI * 45;
    // Calculate the actual progress offset
    const progressOffset = circumference - (progressPercentage / 100) * circumference;

    return (
        <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-full">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-medium">Daily progress</CardTitle>
                    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit your daily goal</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Daily goal</Label>
                                    <Select
                                        value={tempDailyGoal.toString()}
                                        onValueChange={(value) => setTempDailyGoal(parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={`${tempDailyGoal} hours`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(hours => (
                                                <SelectItem key={hours} value={hours.toString()}>
                                                    {hours} hours
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Clear daily progress and completed tasks</Label>
                                    <Input
                                        type="text"
                                        value={`${completedHours}:${completedMinutes.toString().padStart(2, '0')}`}
                                        disabled
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="weekends"
                                        checked={includeWeekends}
                                        onCheckedChange={(checked) => setIncludeWeekends(checked as boolean)}
                                    />
                                    <Label htmlFor="weekends">Include weekends in streaks</Label>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        variant="default"
                                        className="bg-blue-500 hover:bg-blue-600 text-white"
                                        onClick={() => {
                                            onDailyGoalChange(tempDailyGoal);
                                            setIsSettingsOpen(false);
                                        }}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsSettingsOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col mt-8 justify-around h-[calc(100%-4rem)]">
                <div className="flex flex-col items-center">
                    <div className="relative w-full flex justify-around items-center">
                        {/* Yesterday */}
                        <div className="text-center">
                            <div className="text-sm text-muted-foreground">Yesterday</div>
                            <div className={`text-3xl font-medium ${wasYesterdayGoalMet ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                {yesterdayTime < 60 ? yesterdayTime : Math.floor(yesterdayTime / 60)}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                                {yesterdayTime < 60 ? 'minutes' : 'hours'}
                            </div>
                            {!wasYesterdayGoalMet && (
                                <div className="text-xs text-red-500 mt-1">
                                    Goal not met
                                </div>
                            )}
                        </div>

                        {/* Progress circle */}
                        <div className="relative w-[280px] aspect-square">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                {/* Background circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    className="stroke-muted/20 fill-none"
                                    strokeWidth="8"
                                />
                                {/* Progress circle */}
                                {progressPercentage > 0 && (
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        className="stroke-emerald-500 fill-none"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${circumference} ${circumference}`}
                                        strokeDashoffset={progressOffset}
                                        style={{
                                            transition: 'stroke-dashoffset 0.5s ease-in-out'
                                        }}
                                    />
                                )}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-sm text-muted-foreground mb-1">Daily goal</div>
                                <div className="text-4xl font-medium">{dailyGoal}</div>
                                <div className="text-sm text-muted-foreground mt-1">hours</div>
                                <div className={`text-lg font-medium mt-2 ${isDailyGoalMet ? 'text-emerald-500' : 'text-yellow-500'}`}>
                                    {Math.round(progressPercentage)}%
                                </div>
                            </div>
                        </div>

                        {/* Streak */}
                        <div className="text-center">
                            <div className="text-sm text-muted-foreground">days</div>
                            <div className={`text-3xl font-medium ${streakDisplay.color}`}>
                                {streakDisplay.value}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">Streak</div>
                            {streakStatus === "pending" && (
                                <div className="text-xs text-yellow-500 mt-1">
                                    Complete today's goal to maintain streak!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Completed time */}
                <div className="text-sm text-center mb-4">
                    <span className="text-muted-foreground">Completed: </span>
                    <span className={isDailyGoalMet ? 'text-emerald-500' : 'text-muted-foreground'}>
                        {completedHours}h {completedMinutes.toString().padStart(2, '0')}m
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}