import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { Prisma } from "@prisma/client"

// Constants
const MIN_FOCUS_DURATION = 25 * 60; // 25 minutes in seconds
const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes in seconds
const LONG_BREAK_DURATION = 15 * 60; // 15 minutes in seconds
const SESSIONS_BEFORE_LONG_BREAK = 4;

// Types
type SessionMetrics = {
  totalFocusTime: number;
  breakTime: number;
  interruptions: number;
  productivity: number;
}

type Break = {
  startTime: Date;
  endTime?: Date;
  type: 'short' | 'long';
  wasTimely: boolean;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { action, sessionId } = body

    switch (action) {
      case 'start': {
        const { subjectId, phaseType, duration, skipBreaks, timezone, deviceId } = body

        // Create focus session
        const focusSession = await prisma.focusSession.create({
          data: {
            userId: session.user.id,
            subjectId,
            startTime: new Date(),
            totalDuration: duration,
            isActive: true,
            status: 'active' as const,
            phaseType,
            skipBreaks,
            timezone: timezone || "UTC",
            deviceId,
            metrics: JSON.stringify({
              totalFocusTime: 0,
              breakTime: 0,
              interruptions: 0,
              productivity: 100
            } as SessionMetrics),
            breaks: JSON.stringify([] as Break[])
          }
        })

        return NextResponse.json({
          success: true,
          focusSession
        })
      }

      case 'pause': {
        if (!sessionId) {
          return new NextResponse("Session ID is required", { status: 400 })
        }

        const activeSession = await prisma.focusSession.findFirst({
          where: {
            id: sessionId,
            userId: session.user.id,
            isActive: true,
            status: 'active'
          }
        })

        if (!activeSession) {
          return new NextResponse("Session not found or not active", { status: 404 })
        }

        const metrics = JSON.parse(activeSession.metrics as string) as SessionMetrics
        metrics.interruptions += 1

        const updatedSession = await prisma.focusSession.update({
          where: { id: sessionId },
          data: {
            status: 'paused' as const,
            pausedAt: new Date(),
            metrics: JSON.stringify(metrics)
          }
        })

        return NextResponse.json({ success: true, focusSession: updatedSession })
      }

      case 'resume': {
        if (!sessionId) {
          return new NextResponse("Session ID is required", { status: 400 })
        }

        const pausedSession = await prisma.focusSession.findFirst({
          where: {
            id: sessionId,
            userId: session.user.id,
            isActive: true,
            status: 'paused'
          }
        })

        if (!pausedSession || !pausedSession.pausedAt) {
          return new NextResponse("Session not found or not paused", { status: 404 })
        }

        const now = new Date()
        const pauseDuration = Math.floor((now.getTime() - pausedSession.pausedAt.getTime()) / 1000)

        const updatedSession = await prisma.focusSession.update({
          where: { id: sessionId },
          data: {
            status: 'active' as const,
            pausedAt: null,
            pausedDuration: pausedSession.pausedDuration + pauseDuration
          }
        })

        return NextResponse.json({ success: true, focusSession: updatedSession })
      }

      case 'start-break': {
        if (!sessionId) {
          return new NextResponse("Session ID is required", { status: 400 })
        }

        const activeSession = await prisma.focusSession.findFirst({
          where: {
            id: sessionId,
            userId: session.user.id,
            isActive: true,
            status: 'active'
          }
        })

        if (!activeSession) {
          return new NextResponse("Session not found or not active", { status: 404 })
        }

        const breaks = JSON.parse(activeSession.breaks as string) as Break[]
        const breakType = breaks.length > 0 && breaks.length % SESSIONS_BEFORE_LONG_BREAK === 0 ? 'long' as const : 'short' as const
        
        const now = new Date()
        breaks.push({
          startTime: now,
          type: breakType,
          wasTimely: true
        })

        const updatedSession = await prisma.focusSession.update({
          where: { id: sessionId },
          data: {
            breaks: JSON.stringify(breaks),
            lastBreakAt: now
          }
        })

        return NextResponse.json({ success: true, focusSession: updatedSession })
      }

      case 'end-break': {
        if (!sessionId) {
          return new NextResponse("Session ID is required", { status: 400 })
        }

        const activeSession = await prisma.focusSession.findFirst({
          where: {
            id: sessionId,
            userId: session.user.id,
            isActive: true,
            status: 'active'
          }
        })

        if (!activeSession) {
          return new NextResponse("Session not found or not active", { status: 404 })
        }

        const breaks = JSON.parse(activeSession.breaks as string) as Break[]
        const lastBreak = breaks[breaks.length - 1]
        
        if (lastBreak && !lastBreak.endTime) {
          lastBreak.endTime = new Date()
          const breakDuration = Math.floor((lastBreak.endTime.getTime() - new Date(lastBreak.startTime).getTime()) / 1000)
          
          const metrics = JSON.parse(activeSession.metrics as string) as SessionMetrics
          metrics.breakTime += breakDuration

          const updatedSession = await prisma.focusSession.update({
            where: { id: sessionId },
            data: {
              breaks: JSON.stringify(breaks),
              metrics: JSON.stringify(metrics)
            }
          })

          return NextResponse.json({ success: true, focusSession: updatedSession })
        }

        return new NextResponse("No active break found", { status: 400 })
      }

      case 'skip-break': {
        if (!sessionId) {
          return new NextResponse("Session ID is required", { status: 400 })
        }

        const activeSession = await prisma.focusSession.findFirst({
          where: {
            id: sessionId,
            userId: session.user.id,
            isActive: true,
            status: 'active'
          }
        })

        if (!activeSession) {
          return new NextResponse("Session not found or not active", { status: 404 })
        }

        const breaks = JSON.parse(activeSession.breaks as string) as Break[]
        const lastBreak = breaks[breaks.length - 1]
        
        if (lastBreak && !lastBreak.endTime) {
          lastBreak.endTime = new Date()
          lastBreak.wasTimely = false
          
          const metrics = JSON.parse(activeSession.metrics as string) as SessionMetrics
          metrics.interruptions += 1

          const updatedSession = await prisma.focusSession.update({
            where: { id: sessionId },
            data: {
              breaks: JSON.stringify(breaks),
              metrics: JSON.stringify(metrics)
            }
          })

          return NextResponse.json({ success: true, focusSession: updatedSession })
        }

        return new NextResponse("No active break found", { status: 400 })
      }

      case 'stop': {
        if (!sessionId) {
          return new NextResponse(
            JSON.stringify({ 
              success: false, 
              message: "Session ID is required" 
            }), 
            { status: 400 }
          )
        }

        const currentSession = await prisma.focusSession.findFirst({
          where: {
            id: sessionId,
            userId: session.user.id,
            isActive: true
          }
        })

        if (!currentSession) {
          return new NextResponse(
            JSON.stringify({ 
              success: false, 
              message: "Session not found" 
            }), 
            { status: 404 }
          )
        }

        // Don't allow stopping an already completed session
        if (currentSession.status === 'completed') {
          return new NextResponse(
            JSON.stringify({ 
              success: false, 
              message: "Session already completed" 
            }), 
            { status: 400 }
          )
        }

        try {
          // Use a transaction to ensure all updates are atomic
          const result = await prisma.$transaction(async (tx) => {
            // Update focus session
            const now = new Date()
            const breaks = JSON.parse(currentSession.breaks as string) as Break[]
            const totalBreakTime = breaks.reduce((total, b) => {
              if (b.endTime) {
                return total + (new Date(b.endTime).getTime() - new Date(b.startTime).getTime()) / 1000
              }
              return total
            }, 0)

            const totalFocusTime = Math.floor(
              (now.getTime() - currentSession.startTime.getTime() - 
                (currentSession.pausedDuration * 1000) - 
                (totalBreakTime * 1000)
              ) / 1000
            )

            const metrics = JSON.parse(currentSession.metrics as string) as SessionMetrics
            metrics.totalFocusTime = totalFocusTime
            metrics.productivity = Math.round(
              (totalFocusTime / (currentSession.totalDuration * 60)) * 
              (1 - (metrics.interruptions * 0.1)) * 
              100
            )

            const updatedSession = await tx.focusSession.update({
              where: { id: sessionId },
              data: {
                status: 'completed' as const,
                isActive: false,
                endTime: now,
                metrics: JSON.stringify(metrics)
              }
            })

            // Update daily activity
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const dailyActivity = await tx.dailyActivity.upsert({
              where: {
                userId_date: {
                  userId: session.user.id,
                  date: today
                }
              },
              create: {
                userId: session.user.id,
                date: today,
                studyTime: totalFocusTime / 60, // Convert to minutes
                [currentSession.phaseType + 'Time']: totalFocusTime / 60,
                productivity: metrics.productivity,
                focusScore: metrics.productivity,
                interruptions: metrics.interruptions,
                goalCompleted: (totalFocusTime / 60) >= 60 // 1 hour daily goal
              },
              update: {
                studyTime: {
                  increment: totalFocusTime / 60
                },
                [currentSession.phaseType + 'Time']: {
                  increment: totalFocusTime / 60
                },
                productivity: metrics.productivity,
                interruptions: {
                  increment: metrics.interruptions
                },
                goalCompleted: {
                  set: ((await tx.dailyActivity.findUnique({
                    where: {
                      userId_date: {
                        userId: session.user.id,
                        date: today
                      }
                    }
                  }))?.studyTime || 0) + (totalFocusTime / 60) >= 60
                }
              }
            })

            // Update streak
            const studyStreak = await tx.studyStreak.upsert({
              where: {
                userId: session.user.id
              },
              create: {
                userId: session.user.id,
                currentStreak: dailyActivity.goalCompleted ? 1 : 0,
                longestStreak: dailyActivity.goalCompleted ? 1 : 0,
                lastStudyDate: today,
                streakHistory: JSON.stringify([{
                  date: today,
                  goalMet: dailyActivity.goalCompleted
                }])
              },
              update: {
                currentStreak: dailyActivity.goalCompleted ? {
                  increment: 1
                } : {
                  set: 0
                },
                longestStreak: {
                  set: dailyActivity.goalCompleted ? 
                    Math.max((await tx.studyStreak.findUnique({
                      where: { userId: session.user.id }
                    }))?.longestStreak || 0, 
                    ((await tx.studyStreak.findUnique({
                      where: { userId: session.user.id }
                    }))?.currentStreak || 0) + 1) : 
                    undefined
                },
                lastStudyDate: today,
                streakHistory: JSON.stringify([
                  ...JSON.parse((await tx.studyStreak.findUnique({
                    where: { userId: session.user.id }
                  }))?.streakHistory as string || '[]'),
                  {
                    date: today,
                    goalMet: dailyActivity.goalCompleted
                  }
                ])
              }
            })

            return {
              updatedSession,
              dailyActivity,
              studyStreak
            }
          })

          return NextResponse.json({
            success: true,
            focusSession: result.updatedSession,
            dailyActivity: result.dailyActivity,
            currentStreak: result.studyStreak.currentStreak
          })

        } catch (error) {
          console.error("[STOP_SESSION_ERROR]", error)
          return new NextResponse(
            JSON.stringify({ 
              success: false, 
              message: "Failed to save session data. Please try again." 
            }), 
            { status: 500 }
          )
        }
      }

      case 'sync': {
        if (!sessionId) {
          return new NextResponse("Session ID is required", { status: 400 })
        }

        const { metrics, breaks, currentPhase, offlineChanges } = body

        const activeSession = await prisma.focusSession.findFirst({
          where: {
            id: sessionId,
            userId: session.user.id,
            isActive: true
          }
        })

        if (!activeSession) {
          return new NextResponse("Session not found", { status: 404 })
        }

        const updatedSession = await prisma.focusSession.update({
          where: { id: sessionId },
          data: {
            metrics: JSON.stringify(metrics),
            breaks: JSON.stringify(breaks),
            lastSyncedAt: new Date(),
            offlineChanges: offlineChanges ? JSON.stringify(offlineChanges) : null
          }
        })

        return NextResponse.json({ success: true, focusSession: updatedSession })
      }

      default:
        return new NextResponse("Invalid action", { status: 400 })
    }
  } catch (error) {
    console.error("[STUDY_TIME]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 