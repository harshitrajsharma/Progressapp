"use client";

import { DashboardProgressOverview } from "@/components/dashboard/progress-overview";
import { SubjectCount } from "@/components/recommendations/subject-count";
import { ExamCountdown } from "@/components/dashboard/exam-countdown";
import { TopicWeightageAnalysis } from "@/components/dashboard/topic-weightage-analysis";
import { ExamFoundationCard } from "@/components/dashboard/exam-foundation-card";
import { ExpectedMarks } from "@/components/dashboard/expected-marks";
import { MockTest, DailyActivity, StudyStreak } from "@prisma/client";
import { SubjectWithRelations } from "@/lib/calculations/types";
import { calculateDashboardProgress } from "@/lib/calculations/dashboard-progress";
import { calculateExamFoundation } from "@/lib/calculations/exam-foundation";

interface DashboardContentProps {
    user: {
        name: string;
        examName: string;
        examDate: Date;
        subjects: SubjectWithRelations[];
        mockTests: MockTest[];
        studyStreak: StudyStreak | null;
        dailyActivities: DailyActivity[];
        targetMarks: number;
    }
}

export function DashboardContent({ user }: DashboardContentProps) {
    const progress = calculateDashboardProgress(user.subjects);
    const foundationResult = calculateExamFoundation(user.subjects);

    const welcomeHeader = (
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-blue-500">Welcome {user?.name?.split(" ")[0]}</h1>
            <p className="text-muted-foreground">
                Here&apos;s an overview of your {user.examName} preparation
            </p>
        </div>
    );

    return (
        <div className="md:p-8 space-y-6">
            {/* Main Content */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1.3fr_0.7fr]">
                {/* Right Column - Progress Overview & Exam Countdown (For Mobile) */}
                <div className="lg:hidden">
                    {/* Header */}
                    {welcomeHeader}
                    <div className="space-y-6">
                        <ExamCountdown
                            examDate={user.examDate}
                            dailyActivities={user.dailyActivities}
                        />
                        <DashboardProgressOverview
                            progress={progress}
                            subjects={user.subjects}
                        />
                    </div>
                </div>

                {/* Left Column - Header, Strategy & Timer */}
                <div>
                    {/* Header - Desktop */}
                    <div className="mb-6 hidden md:block">
                        {welcomeHeader}
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col-reverse gap-6 lg:flex-row ">
                            {/* Foundation Level Card */}
                            <div className=" lg:w-[65%]">
                                <ExamFoundationCard
                                    key={JSON.stringify(foundationResult)}
                                    result={foundationResult}
                                    examName={user.examName}
                                />
                            </div>
                            {/* Stats Grid */}
                            <div className=" lg:w-[35%] grid grid-cols-2 lg:grid-cols-1 lg:grid-rows-4 gap-4">
                                <SubjectCount subjects={user.subjects} />
                                <ExpectedMarks subjects={user.subjects} targetMarks={user.targetMarks} />
                            </div>
                        </div>
                        <TopicWeightageAnalysis subjects={user.subjects} />
                    </div>
                </div>

                {/* Right Column - Progress Overview & Exam Countdown (For Larger Screens) */}
                <div className="hidden lg:block">
                    <div className="space-y-6">
                        <ExamCountdown
                            examDate={user.examDate}
                            dailyActivities={user.dailyActivities}
                        />
                        <DashboardProgressOverview
                            progress={progress}
                            subjects={user.subjects}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
} 