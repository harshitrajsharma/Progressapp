'use client';

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PlayCircle, PauseCircle, StopCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface StudySession {
  startTime: Date
  endTime?: Date
  duration: number // in minutes
  isActive: boolean
}

export function StudyTimer() {
  const [session, setSession] = useState<StudySession | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

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

    setSession(prev => ({
      ...prev!,
      isActive: false,
      duration: prev!.duration + Math.floor(elapsedTime / 60)
    }))
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

    const endTime = new Date()
    const finalDuration = session.duration + Math.floor(elapsedTime / 60)

    try {
      const response = await fetch('/api/study-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration: finalDuration,
          endTime
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

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="p-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Study Timer</h3>
        <div className="text-3xl font-mono mb-6">
          {formatTime(elapsedTime)}
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