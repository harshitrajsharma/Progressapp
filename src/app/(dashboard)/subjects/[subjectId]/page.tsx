'use client';

import { useEffect, useState, useMemo, useCallback, Suspense, memo } from "react";
import { useParams } from "next/navigation";
import { SubjectHeader } from "@/components/subjects/subject-header";
import { ProgressOverview } from "@/components/subjects/progress-overview";
import { SubjectStats } from "@/components/subjects/subject-stats";
import { ChapterCard } from "@/components/subjects/chapter-card";
import { EmptyChapters } from "@/components/subjects/empty-chapters";
import { AddChapterDialog } from "@/components/subjects/add-chapter-dialog";
import { ChapterCategories } from "@/components/subjects/chapter-categories";
import { TestsData } from "@/components/subjects/tests-data";
import { useToast } from "@/hooks/use-toast";
import { useTopicManagement } from "@/hooks/use-topic-management";
import { calculateSubjectProgress } from "@/lib/calculations";
import { SubjectWithRelations, SubjectProgress, ChapterWithRelations } from "@/lib/calculations/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ChapterCategory } from "@/types/prisma/category";
import { EditSubjectDialog } from "@/components/subjects/edit-subject-dialog";
import { BaseTest } from "@/types/prisma/test";


const progressCache = new Map<string, { progress: SubjectProgress; timestamp: number }>();

interface TopicUpdateData {
  name?: string;
  important?: boolean;
  position?: number;
}

interface Topic {
  id: string;
  name: string;
  important: boolean;
  learningStatus: boolean;
  revisionCount: number;
  practiceCount: number;
  testCount: number;
  chapterId: string;
  position: number;
  lastRevised: Date | null;
  nextRevision: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TopicResponse {
  success: boolean;
  topic: Topic;
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

function CategoryWrapper({ 
  selectedCategory, 
  onCategoryChange 
}: { 
  selectedCategory: ChapterCategory; 
  onCategoryChange: (category: ChapterCategory) => void; 
}) {
  return (
    <ChapterCategories
      selectedCategory={selectedCategory}
      onCategoryChange={onCategoryChange}
    />
  );
}

export default function SubjectPage() {
  const { subjectId } = useParams();
  const actualSubjectId = Array.isArray(subjectId) ? subjectId[0] : subjectId;
  const [subject, setSubject] = useState<SubjectWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ChapterCategory>('learning');
  const { toast } = useToast();
  const { updateTopicStatus, isPending } = useTopicManagement();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [tests, setTests] = useState<BaseTest[]>([]);

  // Memoize progress calculation with increased cache duration
  const progress = useMemo(() => {
    if (!subject || !actualSubjectId) return null;

    // Calculate new progress immediately
    const newProgress = calculateSubjectProgress(subject);

    // Update cache
    const now = Date.now();
    progressCache.set(actualSubjectId, {
      progress: newProgress,
      timestamp: now
    });

    return newProgress;
  }, [subject, actualSubjectId]);

  // Memoize chapters based on selected category
  const filteredChapters = useMemo(() => {
    if (!subject?.chapters) return [];
    return subject.chapters;
  }, [subject?.chapters]);

  // Optimized topic toggle handler with progress update
  const handleTopicToggle = useCallback(async (chapterId: string, topicId: string, checkboxIndex?: number) => {
    if (!subject) return;

    const chapter = subject.chapters.find(c => c.id === chapterId);
    const topic = chapter?.topics.find(t => t.id === topicId);
    if (!topic) return;

    // Calculate current and new values
    const currentValue = selectedCategory === 'learning' 
      ? (topic.learningStatus ? 1 : 0) 
      : topic[`${selectedCategory}Count`];
    
    const newValue = selectedCategory === 'learning'
      ? (topic.learningStatus ? 0 : 1)
      : checkboxIndex !== undefined 
        ? checkboxIndex + 1 
        : Math.min(3, topic[`${selectedCategory}Count`] + 1);

    // Update topic status with existing topic data
    updateTopicStatus(
      topicId,
      topic.name,
      selectedCategory,
      currentValue,
      newValue,
      (data) => {
        setSubject(prev => {
          if (!prev) return prev;
          
          const updatedSubject = {
            ...prev,
            chapters: prev.chapters.map(chapter => 
              chapter.id === chapterId
                ? {
                    ...chapter,
                    topics: chapter.topics.map(t =>
                      t.id === topicId 
                        ? {
                            ...t,
                            ...data.topic,
                            // Ensure all values are preserved
                            learningStatus: data.topic.learningStatus ?? t.learningStatus,
                            revisionCount: data.topic.revisionCount ?? t.revisionCount,
                            practiceCount: data.topic.practiceCount ?? t.practiceCount,
                            testCount: data.topic.testCount ?? t.testCount
                          }
                        : t
                    )
                  }
                : chapter
            )
          };
          
          // Clear progress cache to force recalculation
          progressCache.clear();
          
          return updatedSubject;
        });
      },
      topic // Pass existing topic data
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
      } as SubjectWithRelations;
    });

    toast({
      title: "Success",
      description: "Chapter added successfully",
      className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
    });
  }, [toast]);

  const handleChapterDelete = useCallback(async (chapterId: string) => {
    if (!subject) return;

    try {
      const response = await fetch(`/api/subjects/${subject.id}/chapters/${chapterId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chapter');
      }

      setSubject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          chapters: prev.chapters.filter(chapter => chapter.id !== chapterId)
        };
      });

      toast({
        title: "Success",
        description: "Chapter deleted successfully",
        className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
      });
    } catch (error) {
      console.error('Error deleting chapter:', error);
      toast({
        title: "Error",
        description: "Failed to delete chapter. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw the error so the loading state is cleared
    }
  }, [subject, toast]);

  const handleTopicUpdate = useCallback(async (chapterId: string, topicId: string, data: TopicUpdateData) => {
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
                    ? { ...t, ...data }
                    : t
                )
              }
            : chapter
        )
      };
    });

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

      const result: TopicResponse = await response.json();
      
      // Update with server response if different from optimistic update
      setSubject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          chapters: prev.chapters.map(chapter => 
            chapter.id === chapterId
              ? {
                  ...chapter,
                  topics: chapter.topics.map(t =>
                    t.id === topicId ? result.topic : t
                  )
                }
              : chapter
          )
        };
      });

      toast({
        title: "Success",
        description: "Topic updated successfully",
        className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
      });

      return result;
    } catch (error) {
      // Revert optimistic update on error
      console.error('Error updating topic:', error);
      setSubject(prev => {
        if (!prev) return prev;
        const originalTopic = prev.chapters
          .find(c => c.id === chapterId)
          ?.topics.find(t => t.id === topicId);
        
        if (!originalTopic) return prev;
        
        return {
          ...prev,
          chapters: prev.chapters.map(chapter => 
            chapter.id === chapterId
              ? {
                  ...chapter,
                  topics: chapter.topics.map(t =>
                    t.id === topicId ? originalTopic : t
                  )
                }
              : chapter
          )
        };
      });

      toast({
        title: "Error",
        description: "Failed to update topic. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const handleEditSubject = useCallback((updatedSubject: SubjectWithRelations) => {
    setSubject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ...updatedSubject,
        // Preserve existing relations
        chapters: prev.chapters,
        tests: prev.tests,
        mockTests: prev.mockTests
      };
    });
  }, []);

  // Add test handler
  const handleAddTest = useCallback(async (testData: Omit<BaseTest, "id" | "createdAt" | "updatedAt">) => {
    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      if (!response.ok) {
        throw new Error('Failed to add test');
      }

      const newTest = await response.json();
      
      // Update both tests and subject data
      setTests(prev => [newTest, ...prev]);
      setSubject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tests: [newTest, ...(prev.tests || [])],
          expectedMarks: Math.round((prev.weightage * newTest.score) / 100),
          testProgress: Math.min(newTest.score, 100)
        };
      });

      toast({
        title: "Success",
        description: "Test added successfully",
        className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
      });
    } catch (error) {
      console.error('Error adding test:', error);
      toast({
        title: "Error",
        description: "Failed to add test. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Delete test handler
  const handleDeleteTest = useCallback(async (testId: string) => {
    try {
      const response = await fetch(`/api/test/${testId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete test');
      }

      // Update tests state
      setTests(prev => {
        const newTests = prev.filter(test => test.id !== testId);
        return newTests;
      });

      // Update subject state with new expected marks
      setSubject(prev => {
        if (!prev) return prev;
        const remainingTests = prev.tests.filter(test => test.id !== testId);
        const averageScore = remainingTests.length > 0
          ? remainingTests.reduce((acc, test) => acc + test.score, 0) / remainingTests.length
          : 0;

        return {
          ...prev,
          tests: remainingTests,
          expectedMarks: Math.round((prev.weightage * averageScore) / 100),
          testProgress: Math.min(averageScore, 100)
        };
      });

      toast({
        title: "Success",
        description: "Test deleted successfully",
        className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
      });
    } catch (error) {
      console.error('Error deleting test:', error);
      toast({
        title: "Error",
        description: "Failed to delete test. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Update useEffect to fetch tests along with subject data
  useEffect(() => {
    async function fetchData() {
      try {
        const [subjectResponse, testsResponse] = await Promise.all([
          fetch(`/api/subjects/${actualSubjectId}`),
          fetch(`/api/test?subjectId=${actualSubjectId}`)
        ]);

        if (!subjectResponse.ok || !testsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [subjectData, testsData] = await Promise.all([
          subjectResponse.json(),
          testsResponse.json()
        ]);

        setSubject(subjectData);
        setTests(testsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [actualSubjectId, toast]);

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

      <CategoryWrapper
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
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
                  onDelete={async () => await handleChapterDelete(chapter.id)}
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

      <Suspense fallback={<Skeleton className="h-96" />}>
        <TestsData
          subjectId={subject.id}
          weightage={subject.weightage}
          tests={tests}
          onAddTest={handleAddTest}
          onDeleteTest={handleDeleteTest}
        />
      </Suspense>

      <EditSubjectDialog
        subject={subject}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleEditSubject}
      />
    </div>
  );
} 