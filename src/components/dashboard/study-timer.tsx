'use client';

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PlayCircle, PauseCircle, StopCircle, Settings, Trophy } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StudySession {
  startTime: Date
  endTime?: Date
  duration: number
  isActive: boolean
  subjectId?: string
  phaseType?: 'learning' | 'revision' | 'practice'
}

interface Subject {
  id: string
  name: string
}

export function StudyTimer() {
  const [session, setSession] = useState<StudySession | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(6) // Default 6 hours
  const [totalStudyTime, setTotalStudyTime] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [phaseType, setPhaseType] = useState<'learning' | 'revision' | 'practice'>('learning')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load subjects
        const subjectsRes = await fetch('/api/subjects')
        const subjectsData = await subjectsRes.json()
        setSubjects(subjectsData)

        // Load saved study time and streak
        const today = new Date().toDateString()
        const savedTime = localStorage.getItem(`studyTime_${today}`)
        const savedGoal = localStorage.getItem('dailyGoal')
        const streakRes = await fetch('/api/study-streak')
        const streakData = await streakRes.json()
        
        if (savedTime) setTotalStudyTime(parseInt(savedTime))
        if (savedGoal) setDailyGoal(parseInt(savedGoal))
        if (streakData?.currentStreak) setCurrentStreak(streakData.currentStreak)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    loadData()
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
    if (!selectedSubject) {
      toast({
        title: "Select a subject",
        description: "Please select a subject to track your study progress.",
        variant: "destructive"
      })
      return
    }

    setSession({
      startTime: new Date(),
      duration: 0,
      isActive: true,
      subjectId: selectedSubject,
      phaseType
    })
    setElapsedTime(0)
    toast({
      title: "Study session started",
      description: `Tracking time for ${subjects.find(s => s.id === selectedSubject)?.name}. Stay focused! 💪`
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
    
    const newTotal = totalStudyTime + pausedDuration
    setTotalStudyTime(newTotal)
    
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
    
    const today = new Date().toDateString()
    localStorage.setItem(`studyTime_${today}`, newTotal.toString())

    try {
      const response = await fetch('/api/study-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration: finalDuration,
          subjectId: session.subjectId,
          phaseType: session.phaseType,
          endTime: new Date()
        })
      })

      if (!response.ok) throw new Error('Failed to save study time')

      const data = await response.json()
      if (data.currentStreak) setCurrentStreak(data.currentStreak)

      toast({
        title: "Study session completed",
        description: `Great work! You studied ${subjects.find(s => s.id === session.subjectId)?.name} for ${finalDuration} minutes. 🎉`,
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

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = Math.min(100, (totalStudyTime / (dailyGoal * 60)) * 100)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Study Timer</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">{currentStreak} days</span>
            </div>
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Study Timer Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Daily study goal (hours)</Label>
                    <Input 
                      type="number" 
                      min="1"
                      max="24"
                      value={dailyGoal}
                      onChange={(e) => setDailyGoal(parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!session?.isActive && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Study Phase</Label>
              <Select value={phaseType} onValueChange={(value: 'learning' | 'revision' | 'practice') => setPhaseType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="revision">Revision</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="text-center">
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

          <div className="flex justify-center gap-2 mt-4">
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
      </CardContent>
    </Card>
  )
}