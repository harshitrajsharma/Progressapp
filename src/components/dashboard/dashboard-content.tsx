"use client";

import { DashboardProgressOverview } from "@/components/dashboard/progress-overview";
import { ExamCountdown } from "@/components/dashboard/exam-countdown";
import { TopicWeightageAnalysis } from "@/components/dashboard/topic-weightage-analysis";
import { ExamFoundationCard } from "@/components/dashboard/exam-foundation-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { MockTest, DailyActivity, StudyStreak } from "@prisma/client";
import { SubjectWithRelations } from "@/lib/calculations/types";
import { calculateDashboardProgress } from "@/lib/calculations/dashboard-progress";
import { calculateExamFoundation } from "@/lib/calculations/exam-foundation";
import { calculateSubjectProgress } from "@/lib/calculations";
import { Target } from "lucide-react";
import { useState } from "react";
import { Category } from "@/types/progress";
import { CategoryView } from "./category-view";
import { ProgressCard } from "./progress-card";

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
    const [selectedCategory, setSelectedCategory] = useState<Category>('overall');

    // Calculate completed subjects
    const completedSubjects = user.subjects.filter(subject => {
        const progress = calculateSubjectProgress(subject);
        return progress.learning === 100;
    }).length;

    // Calculate total expected marks
    const totals = user.subjects.reduce((acc, subject) => {
        const progress = calculateSubjectProgress(subject);
        return {
            expectedMarks: acc.expectedMarks + progress.expectedMarks,
            totalWeightage: acc.totalWeightage + subject.weightage
        };
    }, { expectedMarks: 0, totalWeightage: 0 });

    const getProgressValue = (progress: ReturnType<typeof calculateSubjectProgress>, category: Category): number => {
        switch (category) {
            case 'learning': return progress.learning;
            case 'revision': return progress.revision;
            case 'practice': return progress.practice;
            case 'test': return progress.test;
            default: return progress.overall;
        }
    };

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
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
                {/* Left Column */}
                <div>
                    {/* Header - Desktop */}
                    <div className="hidden md:block">
                        {welcomeHeader}
                    </div>

                    {/* Mobile Header and Stats */}
                    <div className="md:hidden">
                        {welcomeHeader}
                        <div className="space-y-6 mb-6">

                            <div className="grid grid-cols-2 md:grid-rows-2 gap-4">
                                <StatsCard
                                    title="Subject Progress"
                                    value={completedSubjects}
                                    total={user.subjects.length}
                                    tooltipText="Number of subjects where learning phase is completed"
                                    suffix="completed"
                                />
                                <StatsCard
                                    title="Projected Marks"
                                    value={Math.round(totals.expectedMarks)}
                                    total={Math.round(totals.totalWeightage)}
                                    tooltipText="Projected Marks based on your test performance across all subjects"
                                    suffix="expected"
                                    badge={{
                                        value: user.targetMarks,
                                        icon: <Target className="h-2.5 w-2.5 sm:h-3 sm:w-3" />,
                                        tooltipText: "Your target marks set during onboarding"
                                    }}
                                />
                            </div>

                            <ExamFoundationCard
                                key={JSON.stringify(foundationResult)}
                                result={foundationResult}
                                examName={user.examName}
                            />

                            <DashboardProgressOverview
                                progress={progress}
                                subjects={user.subjects}
                            />

                            <div className="w-full">
                                <ExamCountdown
                                    examDate={user.examDate}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="space-y-6">
                        <div className="md:flex lg:block gap-6 ">
                            <div className="md:w-[50%] lg:w-[100%] md:flex md:flex-col-reverse lg:flex-row hidden gap-6">
                                <div className="lg:w-[45%]">
                                    <ExamCountdown
                                        examDate={user.examDate}
                                    />
                                </div>
                                <div className=" lg:w-[55%] space-y-6">
                                    <div className="md:grid grid-cols-2 gap-4">
                                        <StatsCard
                                            title="Subject Progress"
                                            value={completedSubjects}
                                            total={user.subjects.length}
                                            tooltipText="Number of subjects where learning phase is completed"
                                            suffix="completed"
                                        />
                                        <StatsCard
                                            title="Projected Marks"
                                            value={Math.round(totals.expectedMarks)}
                                            total={Math.round(totals.totalWeightage)}
                                            tooltipText="Projected Marks based on your test performance across all subjects"
                                            suffix="expected"
                                            badge={{
                                                value: user.targetMarks,
                                                icon: <Target className="h-2.5 w-2.5 sm:h-3 sm:w-3" />,
                                                tooltipText: "Your target marks set during onboarding"
                                            }}
                                        />
                                    </div>

                                    <ProgressCard
                                        progress={progress}
                                        showToggle={false}
                                    />
                                </div>
                            </div>

                            <div className="md:w-[50%] lg:w-[100%] hidden md:block lg:hidden">
                                <div className="space-y-6">
                                    <ExamFoundationCard
                                        key={JSON.stringify(foundationResult)}
                                        result={foundationResult}
                                        examName={user.examName}
                                    />
                                    <div className="space-y-4 rounded-lg">
                                        <CategoryView
                                            subjects={user.subjects}
                                            isExpanded={true}
                                            selectedCategory={selectedCategory}
                                            onCategorySelect={setSelectedCategory}
                                            getProgressValue={getProgressValue}
                                            className=" md:hidden"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <TopicWeightageAnalysis subjects={user.subjects} />
                    </div>
                </div>

                {/* Right Column */}
                <div className="hidden lg:block">
                    <div className="space-y-6">
                        <ExamFoundationCard
                            key={JSON.stringify(foundationResult)}
                            result={foundationResult}
                            examName={user.examName}
                        />
                        <div className="space-y-4 rounded-lg">
                            <CategoryView
                                subjects={user.subjects}
                                isExpanded={true}
                                selectedCategory={selectedCategory}
                                onCategorySelect={setSelectedCategory}
                                getProgressValue={getProgressValue}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 