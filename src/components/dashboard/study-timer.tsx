'use client';

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PlayCircle, PauseCircle, StopCircle, Settings } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface StudySession {
  startTime: Date
  endTime?: Date
  duration: number // in minutes
  isActive: boolean
}

export function StudyTimer() {
  const [session, setSession] = useState<StudySession | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(6) // Default 6 hours
  const [totalStudyTime, setTotalStudyTime] = useState(0) // in minutes
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Load saved study time and goal from localStorage on mount
  useEffect(() => {
    const today = new Date().toDateString()
    const savedTime = localStorage.getItem(`studyTime_${today}`)
    const savedGoal = localStorage.getItem('dailyGoal')
    
    if (savedTime) setTotalStudyTime(parseInt(savedTime))
    if (savedGoal) setDailyGoal(parseInt(savedGoal))
  }, [])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (session?.isActive) {
      interval = setInterval(() => {
        const now = new Date()
        const start = session.startTime
        const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000)
        setElapsedTime(elapsed)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [session])

  const startSession = () => {
    setSession({
      startTime: new Date(),
      duration: 0,
      isActive: true
    })
    setElapsedTime(0)
    toast({
      title: "Study session started",
      description: "Timer is now running. Stay focused! 💪"
    })
  }

  const pauseSession = () => {
    if (!session) return

    const pausedDuration = Math.floor(elapsedTime / 60)
    setSession(prev => ({
      ...prev!,
      isActive: false,
      duration: prev!.duration + pausedDuration
    }))
    
    // Update total study time
    const newTotal = totalStudyTime + pausedDuration
    setTotalStudyTime(newTotal)
    
    // Save to localStorage
    const today = new Date().toDateString()
    localStorage.setItem(`studyTime_${today}`, newTotal.toString())

    toast({
      title: "Session paused",
      description: "Take a short break and come back stronger! 🎯"
    })
  }

  const resumeSession = () => {
    if (!session) return

    setSession(prev => ({
      ...prev!,
      startTime: new Date(),
      isActive: true
    }))
    toast({
      title: "Session resumed",
      description: "Let's keep the momentum going! 🚀"
    })
  }

  const stopSession = async () => {
    if (!session) return

    const finalDuration = session.duration + Math.floor(elapsedTime / 60)
    const newTotal = totalStudyTime + Math.floor(elapsedTime / 60)
    setTotalStudyTime(newTotal)
    
    // Save to localStorage
    const today = new Date().toDateString()
    localStorage.setItem(`studyTime_${today}`, newTotal.toString())

    try {
      const response = await fetch('/api/study-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration: finalDuration,
          endTime: new Date()
        })
      })

      if (!response.ok) throw new Error('Failed to save study time')

      toast({
        title: "Study session completed",
        description: `Great work! You studied for ${finalDuration} minutes. 🎉`,
      })

      setSession(null)
      setElapsedTime(0)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error saving session",
        description: "Please try again.",
        variant: "destructive"
      })
    }
  }

  const updateDailyGoal = (newGoal: number) => {
    setDailyGoal(newGoal)
    localStorage.setItem('dailyGoal', newGoal.toString())
    setIsSettingsOpen(false)
    toast({
      title: "Daily goal updated",
      description: `New goal set to ${newGoal} hours.`
    })
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = Math.min(100, (totalStudyTime / (dailyGoal * 60)) * 100)

  return (
    <Card className="p-4">
      <div className="text-center space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Study Timer</h3>
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Daily Study Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Hours per day</Label>
                  <Input 
                    type="number" 
                    min="1"
                    max="24"
                    value={dailyGoal}
                    onChange={(e) => updateDailyGoal(parseInt(e.target.value))}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="text-3xl font-mono mb-4">
          {formatTime(elapsedTime)}
        </div>

        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m studied</span>
            <span>{dailyGoal}h goal</span>
          </div>
        </div>

        <div className="flex justify-center gap-2">
          {!session ? (
            <Button onClick={startSession} variant="default" size="icon">
              <PlayCircle className="h-6 w-6" />
            </Button>
          ) : (
            <>
              {session.isActive ? (
                <Button onClick={pauseSession} variant="outline" size="icon">
                  <PauseCircle className="h-6 w-6" />
                </Button>
              ) : (
                <Button onClick={resumeSession} variant="default" size="icon">
                  <PlayCircle className="h-6 w-6" />
                </Button>
              )}
              <Button onClick={stopSession} variant="destructive" size="icon">
                <StopCircle className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}