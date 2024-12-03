'use client';

import { useEffect, useState, useMemo, useCallback, Suspense, memo } from "react";
import { useParams } from "next/navigation";
import { SubjectHeader } from "@/components/subjects/subject-header";
import { ProgressOverview } from "@/components/subjects/progress-overview";
import { SubjectStats } from "@/components/subjects/subject-stats";
import { ChapterCard } from "@/components/subjects/chapter-card";
import { EmptyChapters } from "@/components/subjects/empty-chapters";
import { AddChapterDialog } from "@/components/subjects/add-chapter-dialog";
import { ChapterCategories, ChapterCategory } from "@/components/subjects/chapter-categories";
import { useToast } from "@/hooks/use-toast";
import { useTopicManagement } from "@/hooks/use-topic-management";
import { calculateSubjectProgress } from "@/lib/calculations";
import { SubjectWithRelations, SubjectProgress } from "@/lib/calculations/types";
import { Skeleton } from "@/components/ui/skeleton";

// Increase cache duration to 30 seconds for better performance
const CACHE_DURATION = 30000;
const progressCache = new Map<string, { progress: SubjectProgress; timestamp: number }>();

interface TopicUpdateData {
  name?: string;
  important?: boolean;
  position?: number;
}

// Loading skeleton component
const SubjectSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-20 bg-muted rounded-lg" />
    <div className="grid gap-6 md:grid-cols-2">
      <div className="h-40 bg-muted rounded-lg" />
      <div className="h-40 bg-muted rounded-lg" />
    </div>
    <div className="h-12 bg-muted rounded-lg" />
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-muted rounded-lg" />
      ))}
    </div>
  </div>
);

// Memoized chapter card component
const MemoizedChapterCard = memo(ChapterCard);

export default function SubjectPage() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState<SubjectWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ChapterCategory>('learning');
  const { toast } = useToast();
  const { updateTopicStatus, isPending } = useTopicManagement();

  // Memoize progress calculation with increased cache duration
  const progress = useMemo(() => {
    if (!subject || !subjectId) return null;

    const cached = progressCache.get(subjectId);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return cached.progress;
    }

    const newProgress = calculateSubjectProgress(subject);
    progressCache.set(subjectId, {
      progress: newProgress,
      timestamp: now
    });

    return newProgress;
  }, [subject, subjectId]);

  // Memoize chapters based on selected category
  const filteredChapters = useMemo(() => {
    if (!subject?.chapters) return [];
    return subject.chapters;
  }, [subject?.chapters]);

  // Optimized topic toggle handler
  const handleTopicToggle = useCallback(async (chapterId: string, topicId: string, checkboxIndex?: number) => {
    if (!subject) return;

    const chapter = subject.chapters.find(c => c.id === chapterId);
    const topic = chapter?.topics.find(t => t.id === topicId);
    if (!topic) return;

    // Optimistic update
    setSubject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        chapters: prev.chapters.map(chapter => 
          chapter.id === chapterId
            ? {
                ...chapter,
                topics: chapter.topics.map(t =>
                  t.id === topicId
                    ? {
                        ...t,
                        [selectedCategory === 'learning' ? 'learningStatus' : `${selectedCategory}Count`]:
                          selectedCategory === 'learning'
                            ? !t.learningStatus
                            : checkboxIndex !== undefined
                            ? checkboxIndex + 1
                            : t[`${selectedCategory}Count`] + 1
                      }
                    : t
                )
              }
            : chapter
        )
      };
    });

    // API update
    updateTopicStatus(
      topicId,
      topic.name,
      selectedCategory,
      selectedCategory === 'learning' ? (topic.learningStatus ? 1 : 0) : topic[`${selectedCategory}Count`],
      selectedCategory === 'learning' ? (topic.learningStatus ? 0 : 1) : checkboxIndex !== undefined ? checkboxIndex + 1 : topic[`${selectedCategory}Count`] + 1,
      (data) => {
        // Only update if server data is different from optimistic update
        if (JSON.stringify(data.topic) !== JSON.stringify(topic)) {
          setSubject(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              chapters: prev.chapters.map(chapter => 
                chapter.id === chapterId
                  ? {
                      ...chapter,
                      topics: chapter.topics.map(t =>
                        t.id === topicId ? data.topic : t
                      )
                    }
                  : chapter
              )
            };
          });
        }
      }
    );
  }, [subject, selectedCategory, updateTopicStatus]);

  const handleChapterEdit = useCallback((chapterId: string, updatedChapter: { name: string; important: boolean }) => {
    setSubject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        chapters: prev.chapters.map(chapter => 
          chapter.id === chapterId
            ? {
                ...chapter,
                name: updatedChapter.name,
                important: updatedChapter.important
              }
            : chapter
        )
      };
    });
  }, []);

  const handleAddTopic = useCallback((chapterId: string, topic: { id: string; name: string }) => {
    setSubject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        chapters: prev.chapters.map(chapter => 
          chapter.id === chapterId
            ? {
                ...chapter,
                topics: [...chapter.topics, {
                  id: topic.id,
                  name: topic.name,
                  important: false,
                  learningStatus: false,
                  revisionCount: 0,
                  practiceCount: 0,
                  testCount: 0,
                  chapterId: chapter.id,
                  position: chapter.topics.length,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  lastRevised: null,
                  nextRevision: null,
                }]
              }
            : chapter
        )
      };
    });
  }, []);

  const handleTopicDelete = useCallback(async (chapterId: string, topicId: string) => {
    try {
      const response = await fetch(`/api/topics/${topicId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete topic');
      }

      setSubject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          chapters: prev.chapters.map(chapter =>
            chapter.id === chapterId
              ? {
                  ...chapter,
                  topics: chapter.topics.filter(topic => topic.id !== topicId)
                }
              : chapter
          )
        };
      });

      toast({
        title: "Success",
        description: "Topic deleted successfully",
        className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
      });
    } catch (error) {
      console.error('Error deleting topic:', error);
      toast({
        title: "Error",
        description: "Failed to delete topic. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleAddChapter = useCallback((newChapter: ChapterWithRelations) => {
    setSubject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        chapters: [...prev.chapters, newChapter]
      };
    });

    toast({
      title: "Success",
      description: "Chapter added successfully",
      className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
    });
  }, [toast]);

  const handleTopicUpdate = useCallback(async (chapterId: string, topicId: string, data: TopicUpdateData) => {
    try {
      const response = await fetch(`/api/topics/${topicId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update topic');
      }

      const updatedTopic = await response.json();

      setSubject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          chapters: prev.chapters.map(chapter => {
            if (chapter.id !== chapterId) return chapter;
            
            if ('position' in data) {
              const topics = [...chapter.topics];
              const oldIndex = topics.findIndex(t => t.id === topicId);
              const newIndex = data.position!;
              
              if (oldIndex !== -1) {
                const [movedTopic] = topics.splice(oldIndex, 1);
                topics.splice(newIndex, 0, movedTopic);
                
                return {
                  ...chapter,
                  topics: topics.map((t, index) => ({
                    ...t,
                    position: index
                  }))
                };
              }
            }
            
            return {
              ...chapter,
              topics: chapter.topics.map(topic =>
                topic.id === topicId ? { ...topic, ...updatedTopic } : topic
              )
            };
          })
        };
      });

      return updatedTopic;
    } catch (error) {
      console.error('Error updating topic:', error);
      toast({
        title: "Error",
        description: "Failed to update topic",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Fetch subject data
  useEffect(() => {
    async function fetchSubject() {
      try {
        const response = await fetch(`/api/subjects/${subjectId}`);
        if (!response.ok) throw new Error('Failed to fetch subject');
        const data = await response.json();
        setSubject(data);
      } catch (error) {
        console.error('Error fetching subject:', error);
        toast({
          title: "Error",
          description: "Failed to load subject data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubject();
  }, [subjectId, toast]);

  if (isLoading) {
    return <SubjectSkeleton />;
  }

  if (!subject || !progress) {
    return <div>Subject not found</div>;
  }

  return (
    <div className="space-y-8">
      <Suspense>
        <SubjectHeader 
          subject={subject}
          chaptersCount={subject.chapters.length}
          topicsCount={subject.chapters.reduce((acc, chapter) => acc + chapter.topics.length, 0)}
        />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-40" />}>
          <ProgressOverview progress={progress} />
        </Suspense>
        <div className="space-y-6">
          <Suspense fallback={<Skeleton className="h-40" />}>
            <SubjectStats subject={subject} />
          </Suspense>
        </div>
      </div>

      <ChapterCategories
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        variant="default"
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Chapters</h2>
          <AddChapterDialog 
            subjectId={subject.id}
            onSuccess={handleAddChapter}
          />
        </div>

        <div className="space-y-4">
          {filteredChapters.length === 0 ? (
            <EmptyChapters subjectId={subject.id} />
          ) : (
            <Suspense fallback={
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            }>
              {filteredChapters.map(chapter => (
                <MemoizedChapterCard
                  key={chapter.id}
                  id={chapter.id}
                  name={chapter.name}
                  topics={chapter.topics}
                  progress={progress[selectedCategory]}
                  category={selectedCategory}
                  important={chapter.important}
                  onTopicToggle={(topicId, checkboxIndex) => handleTopicToggle(chapter.id, topicId, checkboxIndex)}
                  onEdit={handleChapterEdit}
                  onAddTopic={handleAddTopic}
                  onUpdateTopic={handleTopicUpdate}
                  onDeleteTopic={handleTopicDelete}
                  isPending={isPending}
                />
              ))}
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
} 