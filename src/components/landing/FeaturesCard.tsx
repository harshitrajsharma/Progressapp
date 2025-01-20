"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { SmartRecommendations } from "@/components/recommendations/smart-recommendations";
import { ChapterCard } from "@/components/subjects/chapter-card";
import { ChapterCategories } from "@/components/subjects/chapter-categories";
import { ChapterCategory } from "@/types/prisma/category";
import { SubjectCard } from "@/components/subjects/subject-card";
import { Card } from "@/components/ui/card";
import { demoApi } from "@/lib/demo-api";
import { useToast } from "@/hooks/use-toast";
import { SubjectWithRelations } from "@/types/prisma/subject";
import { Skeleton } from "@/components/ui/skeleton";

function FeaturesCard() {
  const [selectedCategory, setSelectedCategory] = useState<ChapterCategory>('learning');
  const [subjects, setSubjects] = useState<SubjectWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingTopics, setPendingTopics] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Get the first subject for demo
  const demoSubject = subjects[0];

  const loadSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await demoApi.getSubjects();
      setSubjects(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load subjects. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const handleTopicToggle = async (chapterId: string, topicId: string) => {
    try {
      setPendingTopics(prev => new Set(prev).add(topicId));

      const topic = demoSubject.chapters
        .find(c => c.id === chapterId)
        ?.topics.find(t => t.id === topicId);

      if (!topic) return;

      const newStatus = !topic.learningStatus;

      await demoApi.updateTopic(chapterId, topicId, {
        learningStatus: newStatus
      });

      // Refresh subjects to get updated progress
      await loadSubjects();

      toast({
        title: "Success",
        description: `Topic marked as ${newStatus ? 'completed' : 'incomplete'}`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update topic status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPendingTopics(prev => {
        const next = new Set(prev);
        next.delete(topicId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-[1400px] space-y-8">
        <Skeleton className="w-full h-[400px]" />
        <Skeleton className="w-full h-[300px]" />
      </div>
    );
  }

  return (
    <div className=" relative overflow-hidden">
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-[1400px]'>

        {/* Background gradient effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 dark:bg-black/90" />
          <div className="absolute -top-1/4 left-1/4 w-1/2 h-1/2 bg-indigo-500/20 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center text-black dark:text-white max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
            >
              Smart {" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-500">
                Personalized Recommendations
              </span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground"
            >
              Recommendation designed to help you based on your subjects progress
            </p>
          </div>
        </div>

        {/* Smart Recommendations Section */}
        <div className="mb-12">
          <SmartRecommendations subjects={subjects} />
        </div>

        <div className="text-center text-black dark:text-white max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
          >
            Analyze each Subject {" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-500">
              on Key Areas
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground"
          >
            To master each subject <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-500">
              Learning should be done 1 time,
              Revision 3 times,
              Practice 3 times,
              Tests 3 times,
            </span>
          </p>
        </div>

        {demoSubject && (
          <Card className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left side - Subject Card */}
              <div className="lg:col-span-1">
                <SubjectCard
                  subject={demoSubject}
                  category="in-progress"
                />
              </div>

              {/* Right side - Chapters */}
              <div className="lg:col-span-2 space-y-6">
                {/* Chapter Categories */}
                <div className="flex justify-start mb-4">
                  <ChapterCategories
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                  />
                </div>

                {/* Chapter Cards */}
                <div className="space-y-4">
                  {demoSubject.chapters.map((chapter) => (
                    <ChapterCard
                      key={chapter.id}
                      id={chapter.id}
                      name={chapter.name}
                      topics={chapter.topics}
                      category={selectedCategory}
                      important={chapter.important}
                      onTopicToggle={(topicId) => handleTopicToggle(chapter.id, topicId)}
                      progress={chapter[`${selectedCategory}Progress`]}
                      isPending={(topicId) => pendingTopics.has(topicId)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div >
  );
}

export default FeaturesCard;