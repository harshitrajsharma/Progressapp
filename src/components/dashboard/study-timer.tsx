'use client';

import { useState, useEffect } from 'react'
import { FocusSession } from './focus-session'
import { StudyProgress } from './study-progress'
import { toast } from "@/hooks/use-toast"

export function StudyTimer() {
  const [dailyGoal, setDailyGoal] = useState(8) // Default 8 hours
  const [totalStudyTime, setTotalStudyTime] = useState(0)
  const [yesterdayTime, setYesterdayTime] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedPhase, setSelectedPhase] = useState<string>('learning')
  const [goalCompletedToday, setGoalCompletedToday] = useState(false)

  // Validate streak at midnight
  useEffect(() => {
    const validateStreak = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if yesterday's goal was met
      const yesterdayGoalMet = yesterdayTime >= dailyGoal * 60;
      
      if (!yesterdayGoalMet) {
        // Reset streak if yesterday's goal wasn't met
        setCurrentStreak(0);
        localStorage.removeItem('currentStreak');
      }
    };

    // Run validation at load and set up midnight check
    validateStreak();
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const midnightTimeout = setTimeout(validateStreak, timeUntilMidnight);
    return () => clearTimeout(midnightTimeout);
  }, [yesterdayTime, dailyGoal]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get today's and yesterday's dates
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        // Load saved data
        const savedTime = localStorage.getItem(`studyTime_${today.toDateString()}`)
        const savedYesterdayTime = localStorage.getItem(`studyTime_${yesterday.toDateString()}`)
        const savedGoal = localStorage.getItem('dailyGoal')
        const savedGoalCompleted = localStorage.getItem(`goalCompleted_${today.toDateString()}`)
        
        // Load streak data
        const streakRes = await fetch('/api/study-streak')
        const streakData = await streakRes.json()
        
        if (savedTime) setTotalStudyTime(parseInt(savedTime))
        if (savedYesterdayTime) {
          const yesterdayMinutes = parseInt(savedYesterdayTime);
          setYesterdayTime(yesterdayMinutes);
          
          // Validate streak based on yesterday's performance
          if (streakData?.currentStreak && yesterdayMinutes < dailyGoal * 60) {
            setCurrentStreak(0);
            // Update streak in backend
            await fetch('/api/study-streak/reset', { method: 'POST' });
          } else {
            setCurrentStreak(streakData?.currentStreak || 0);
          }
        }
        if (savedGoal) setDailyGoal(parseInt(savedGoal))
        if (savedGoalCompleted) setGoalCompletedToday(JSON.parse(savedGoalCompleted))

        // If no yesterday time saved, try to get it from the API
        if (!savedYesterdayTime) {
          const yesterdayRes = await fetch('/api/study-time/daily?date=' + yesterday.toISOString())
          const yesterdayData = await yesterdayRes.json()
          if (yesterdayData.studyTime) {
            const yesterdayMinutes = yesterdayData.studyTime;
            setYesterdayTime(yesterdayMinutes)
            localStorage.setItem(`studyTime_${yesterday.toDateString()}`, yesterdayMinutes.toString())
            
            // Validate streak based on fetched yesterday's performance
            if (streakData?.currentStreak && yesterdayMinutes < dailyGoal * 60) {
              setCurrentStreak(0);
              // Update streak in backend
              await fetch('/api/study-streak/reset', { method: 'POST' });
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    loadData()
  }, [dailyGoal])

  const handleSessionComplete = async (duration: number, subject: string, phase: string) => {
    try {
      const newTotalTime = totalStudyTime + duration;
      const wasGoalCompletedBefore = goalCompletedToday;
      const isGoalCompletedNow = newTotalTime >= dailyGoal * 60;
      
      // Check if this session completion results in meeting the daily goal
      const shouldUpdateStreak = !wasGoalCompletedBefore && isGoalCompletedNow;
      
      // Only increment streak if yesterday's goal was also met
      const canIncrementStreak = yesterdayTime >= dailyGoal * 60;

      const response = await fetch('/api/study-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stop',
          duration,
          subjectId: subject,
          phaseType: phase,
          dailyGoalMet: isGoalCompletedNow,
          shouldUpdateStreak: shouldUpdateStreak && canIncrementStreak
        })
      })

      if (!response.ok) throw new Error('Failed to save session')

      const data = await response.json()
      
      // Update streak if goal was met for the first time today AND yesterday's goal was met
      if (shouldUpdateStreak) {
        if (canIncrementStreak) {
          setCurrentStreak(data.currentStreak || currentStreak + 1)
          toast({
            title: "Daily Goal Achieved! 🎉",
            description: `You've maintained a ${data.currentStreak} day streak!`,
          })
        } else {
          toast({
            title: "Daily Goal Achieved! 🎉",
            description: "Great job! Complete tomorrow's goal to start a new streak!",
          })
        }
        setGoalCompletedToday(true)
        localStorage.setItem(`goalCompleted_${new Date().toDateString()}`, 'true')
      }

      setTotalStudyTime(newTotalTime)
      const today = new Date().toDateString()
      localStorage.setItem(`studyTime_${today}`, newTotalTime.toString())

      toast({
        title: "Focus session completed",
        description: `Great work! You studied for ${duration} minutes.`,
      })
    } catch (error) {
      console.error('Error saving session:', error)
      toast({
        title: "Error saving session",
        description: "Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDailyGoalChange = async (hours: number) => {
    try {
      // Update local state
      setDailyGoal(hours)
      localStorage.setItem('dailyGoal', hours.toString())

      // Update in database
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dailyGoal: hours
        })
      })

      if (!response.ok) throw new Error('Failed to save settings')

      toast({
        title: "Settings saved",
        description: `Your daily goal has been updated to ${hours} hours.`,
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error saving settings",
        description: "Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <FocusSession
        onSessionComplete={(duration) => handleSessionComplete(duration, selectedSubject, selectedPhase)}
        onSubjectChange={setSelectedSubject}
        onPhaseChange={setSelectedPhase}
      />
      <StudyProgress
        dailyGoal={dailyGoal}
        totalStudyTime={totalStudyTime}
        currentStreak={currentStreak}
        yesterdayTime={yesterdayTime}
        onDailyGoalChange={handleDailyGoalChange}
      />
    </div>
  )
}