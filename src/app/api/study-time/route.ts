// import { NextResponse } from "next/server"
// import { getServerSession } from "next-auth"
// import { prisma } from "@/lib/db"
// import { authOptions } from "@/lib/auth"

// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions)
//     if (!session?.user) {
//       return new NextResponse("Unauthorized", { status: 401 })
//     }

//     const body = await req.json()
//     const { action, duration, skipBreaks, elapsedTime } = body

//     switch (action) {
//       case 'start': {
//         const focusSession = await prisma.focusSession.create({
//           data: {
//             userId: session.user.id,
//             startTime: new Date(),
//             totalDuration: duration,
//             isActive: true,
//             skipBreaks,
//             breaks: 0,
//             pausedDuration: 0
//           }
//         })
//         return NextResponse.json({ success: true, focusSession })
//       }

//       case 'pause': {
//         const activeSession = await prisma.focusSession.findFirst({
//           where: {
//             userId: session.user.id,
//             isActive: true,
//             endTime: null
//           }
//         })

//         if (!activeSession) {
//           return new NextResponse("No active session found", { status: 404 })
//         }

//         const updatedSession = await prisma.focusSession.update({
//           where: { id: activeSession.id },
//           data: {
//             isActive: false,
//             pausedAt: new Date(),
//             pausedDuration: activeSession.pausedDuration + elapsedTime
//           }
//         })

//         return NextResponse.json({ success: true, focusSession: updatedSession })
//       }

//       case 'resume': {
//         const pausedSession = await prisma.focusSession.findFirst({
//           where: {
//             userId: session.user.id,
//             isActive: false,
//             endTime: null
//           }
//         })

//         if (!pausedSession) {
//           return new NextResponse("No paused session found", { status: 404 })
//         }

//         const updatedSession = await prisma.focusSession.update({
//           where: { id: pausedSession.id },
//           data: {
//             isActive: true,
//             pausedAt: null,
//             breaks: pausedSession.breaks + 1
//           }
//         })

//         return NextResponse.json({ success: true, focusSession: updatedSession })
//       }

//       case 'stop': {
//         const activeSession = await prisma.focusSession.findFirst({
//           where: {
//             userId: session.user.id,
//             endTime: null
//           }
//         })

//         if (!activeSession) {
//           return new NextResponse("No session found", { status: 404 })
//         }

//         // Update focus session
//         const updatedSession = await prisma.focusSession.update({
//           where: { id: activeSession.id },
//           data: {
//             isActive: false,
//             endTime: new Date(),
//             totalDuration: duration
//           }
//         })

//         // Update daily activity
//         const today = new Date()
//         today.setHours(0, 0, 0, 0)

//         const dailyActivity = await prisma.dailyActivity.upsert({
//           where: {
//             userId_date: {
//               userId: session.user.id,
//               date: today
//             }
//           },
//           create: {
//             userId: session.user.id,
//             date: today,
//             studyTime: duration,
//             topicsCount: 0,
//             testsCount: 0
//           },
//           update: {
//             studyTime: {
//               increment: duration
//             }
//           }
//         })

//         // Update streak
//         const yesterday = new Date(today)
//         yesterday.setDate(yesterday.getDate() - 1)

//         const yesterdayActivity = await prisma.dailyActivity.findFirst({
//           where: {
//             userId: session.user.id,
//             date: yesterday
//           }
//         })

//         const studyStreak = await prisma.studyStreak.upsert({
//           where: {
//             userId: session.user.id
//           },
//           create: {
//             userId: session.user.id,
//             currentStreak: 1,
//             lastStudyDate: today
//           },
//           update: {
//             currentStreak: yesterdayActivity ? { increment: 1 } : 1,
//             lastStudyDate: today
//           }
//         })

//         return NextResponse.json({
//           success: true,
//           focusSession: updatedSession,
//           dailyActivity,
//           currentStreak: studyStreak.currentStreak
//         })
//       }

//       default:
//         return new NextResponse("Invalid action", { status: 400 })
//     }
//   } catch (error) {
//     console.error("[STUDY_TIME]", error)
//     return new NextResponse("Internal Error", { status: 500 })
//   }
// } 