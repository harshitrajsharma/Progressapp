import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface StudyStreak {
  currentStreak: number
  longestStreak: number
  lastStudyDate: Date
  dailyGoals: number
  dailyProgress: number
}

export function useStudyStreak() {
  const [streak, setStreak] = useState<StudyStreak | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchStreak() {
      try {
        const response = await fetch('/api/study-streak')
        if (!response.ok) throw new Error('Failed to fetch streak data')
        
        const data = await response.json()
        setStreak(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load streak data')
      } finally {
        setLoading(false)
      }
    }

    fetchStreak()
  }, [])

  async function updateDailyProgress(progress: number) {
    try {
      const response = await fetch('/api/study-streak', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyProgress: progress }),
      })

      if (!response.ok) throw new Error('Failed to update progress')
      
      const updatedStreak = await response.json()
      setStreak(updatedStreak)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress')
    }
  }

  return {
    streak,
    loading,
    error,
    updateDailyProgress,
  }
} 