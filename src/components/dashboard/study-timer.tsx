// 'use client';

// import { useState, useEffect } from 'react'
// import { FocusSession } from './focus-session'
// import { StudyProgress } from './study-progress'
// import { toast } from "@/hooks/use-toast"

// export function StudyTimer() {
//   const [dailyGoal, setDailyGoal] = useState(8) // Default 8 hours
//   const [totalStudyTime, setTotalStudyTime] = useState(0)
//   const [yesterdayTime, setYesterdayTime] = useState(0)
//   const [currentStreak, setCurrentStreak] = useState(0)
//   const [selectedSubject, setSelectedSubject] = useState<string>('')
//   const [selectedPhase, setSelectedPhase] = useState<string>('learning')

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         // Get today's and yesterday's dates
//         const today = new Date()
//         today.setHours(0, 0, 0, 0)
//         const yesterday = new Date(today)
//         yesterday.setDate(yesterday.getDate() - 1)

//         // Load saved data
//         const savedTime = localStorage.getItem(`studyTime_${today.toDateString()}`)
//         const savedYesterdayTime = localStorage.getItem(`studyTime_${yesterday.toDateString()}`)
//         const savedGoal = localStorage.getItem('dailyGoal')
        
//         // Load streak data
//         const streakRes = await fetch('/api/study-streak')
//         const streakData = await streakRes.json()
        
//         if (savedTime) setTotalStudyTime(parseInt(savedTime))
//         if (savedYesterdayTime) setYesterdayTime(parseInt(savedYesterdayTime))
//         if (savedGoal) setDailyGoal(parseInt(savedGoal))
//         if (streakData?.currentStreak) setCurrentStreak(streakData.currentStreak)

//         // If no yesterday time saved, try to get it from the API
//         if (!savedYesterdayTime) {
//           const yesterdayRes = await fetch('/api/study-time/daily?date=' + yesterday.toISOString())
//           const yesterdayData = await yesterdayRes.json()
//           if (yesterdayData.studyTime) {
//             setYesterdayTime(yesterdayData.studyTime)
//             localStorage.setItem(`studyTime_${yesterday.toDateString()}`, yesterdayData.studyTime.toString())
//           }
//         }
//       } catch (error) {
//         console.error('Error loading data:', error)
//       }
//     }

//     loadData()
//   }, [])

//   const handleSessionComplete = async (duration: number, subject: string, phase: string) => {
//     try {
//       const response = await fetch('/api/study-time', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           action: 'stop',
//           duration,
//           subjectId: subject,
//           phaseType: phase
//         })
//       })

//       if (!response.ok) throw new Error('Failed to save session')

//       const data = await response.json()
//       setCurrentStreak(data.currentStreak || 0)
//       setTotalStudyTime(prev => prev + duration)

//       const today = new Date().toDateString()
//       localStorage.setItem(`studyTime_${today}`, (totalStudyTime + duration).toString())

//       toast({
//         title: "Focus session completed",
//         description: `Great work! You studied for ${duration} minutes. 🎉`,
//       })
//     } catch (error) {
//       console.error('Error saving session:', error)
//       toast({
//         title: "Error saving session",
//         description: "Please try again.",
//         variant: "destructive"
//       })
//     }
//   }

//   const handleDailyGoalChange = async (hours: number) => {
//     try {
//       // Update local state
//       setDailyGoal(hours)
//       localStorage.setItem('dailyGoal', hours.toString())

//       // Update in database
//       const response = await fetch('/api/settings', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           dailyGoal: hours
//         })
//       })

//       if (!response.ok) throw new Error('Failed to save settings')

//       toast({
//         title: "Settings saved",
//         description: `Your daily goal has been updated to ${hours} hours.`,
//       })
//     } catch (error) {
//       console.error('Error saving settings:', error)
//       toast({
//         title: "Error saving settings",
//         description: "Please try again.",
//         variant: "destructive"
//       })
//     }
//   }

//   return (
//     <div className="grid gap-6 xl:grid-cols-2">
//       <FocusSession
//         onSessionComplete={(duration) => handleSessionComplete(duration, selectedSubject, selectedPhase)}
//         onSubjectChange={setSelectedSubject}
//         onPhaseChange={setSelectedPhase}
//       />
//       <StudyProgress
//         dailyGoal={dailyGoal}
//         totalStudyTime={totalStudyTime}
//         currentStreak={currentStreak}
//         yesterdayTime={yesterdayTime}
//         onDailyGoalChange={handleDailyGoalChange}
//       />
//     </div>
//   )
// }