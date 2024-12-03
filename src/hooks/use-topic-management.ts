import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface Topic {
  id: string;
  name: string;
  learningStatus: boolean;
  revisionCount: number;
  practiceCount: number;
  testCount: number;
}

interface ChapterProgress {
  learning: number;
  revision: number;
  practice: number;
  test: number;
  overall: number;
}

type TopicCategory = 'learning' | 'revision' | 'practice' | 'test';

export function useTopicManagement() {
  const { toast } = useToast();
  const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set());

  const getCelebrationMessage = (
    topicName: string, 
    category: TopicCategory, 
    count: number
  ) => {
    const message = {
      learning: {
        emoji: "🎓",
        title: "Topic Mastered!",
        description: `You've completed learning "${topicName}". Keep up the great work!`
      },
      revision: {
        emoji: count === 3 ? "📚" : "📖",
        title: count === 3 ? "Perfect Revision!" : "Revision Progress!",
        description: count === 3 
          ? `You've mastered all revisions for "${topicName}"!` 
          : `Great job on revising "${topicName}"! ${3 - count} revisions to go.`
      },
      practice: {
        emoji: count === 3 ? "💪" : "✍️",
        title: count === 3 ? "Practice Makes Perfect!" : "Practice Progress!",
        description: count === 3 
          ? `You've completed all practice sessions for "${topicName}"!` 
          : `Keep practicing "${topicName}"! ${3 - count} sessions to go.`
      },
      test: {
        emoji: count === 3 ? "🏆" : "📝",
        title: count === 3 ? "Test Champion!" : "Test Progress!",
        description: count === 3 
          ? `You've aced all test attempts for "${topicName}"!` 
          : `Good progress on "${topicName}" tests! ${3 - count} attempts to go.`
      }
    };

    return {
      title: `${message[category].emoji} ${message[category].title}`,
      description: message[category].description
    };
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4CAF50', '#2196F3', '#FF9800', '#E91E63']
    });
  };

  const updateTopicStatus = async (
    topicId: string,
    topicName: string,
    category: TopicCategory,
    currentValue: number,
    newValue: number,
    onSuccess: (data: any) => void
  ) => {
    if (pendingUpdates.has(topicId)) return;
    setPendingUpdates(prev => new Set(prev).add(topicId));

    // Prepare optimistic update data with all required fields
    const optimisticData = {
      topic: {
        id: topicId,
        name: topicName,
        [category === 'learning' ? 'learningStatus' : `${category}Count`]: newValue,
        learningStatus: category === 'learning' ? newValue === 1 : undefined,
        revisionCount: category === 'revision' ? newValue : undefined,
        practiceCount: category === 'practice' ? newValue : undefined,
        testCount: category === 'test' ? newValue : undefined
      },
      chapterProgress: {
        learning: 0,
        revision: 0,
        practice: 0,
        test: 0,
        overall: 0
      }
    };

    try {
      // Immediately update UI optimistically
      onSuccess(optimisticData);

      // Make API request in background
      const response = await fetch(`/api/topics/${topicId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: category,
          count: newValue
        }),
      });

      if (!response.ok) throw new Error('Failed to update topic status');
      const data = await response.json();

      // Show celebration for completing a category
      if (
        (category === 'learning' && newValue === 1) || 
        (category !== 'learning' && newValue === 3)
      ) {
        triggerCelebration();
      }

      // Show toast message for progress
      if (newValue > currentValue) {
        const message = getCelebrationMessage(topicName, category, newValue);
        toast({
          title: message.title,
          description: message.description,
          className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
          duration: 5000,
        });
      }

      // Only update if server data is significantly different
      const hasSignificantChanges = 
        data.topic[category === 'learning' ? 'learningStatus' : `${category}Count`] !== 
        optimisticData.topic[category === 'learning' ? 'learningStatus' : `${category}Count`];

      if (hasSignificantChanges) {
        onSuccess(data);
      }
    } catch (error) {
      console.error('Error updating topic status:', error);
      // Revert UI to previous state
      onSuccess({
        topic: {
          id: topicId,
          name: topicName,
          [category === 'learning' ? 'learningStatus' : `${category}Count`]: currentValue,
          learningStatus: category === 'learning' ? currentValue === 1 : undefined,
          revisionCount: category === 'revision' ? currentValue : undefined,
          practiceCount: category === 'practice' ? currentValue : undefined,
          testCount: category === 'test' ? currentValue : undefined
        },
        chapterProgress: {
          learning: 0,
          revision: 0,
          practice: 0,
          test: 0,
          overall: 0
        }
      });
      toast({
        title: "❌ Error",
        description: "Failed to update topic status. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setPendingUpdates(prev => {
        const next = new Set(prev);
        next.delete(topicId);
        return next;
      });
    }
  };

  return {
    updateTopicStatus,
    isPending: (topicId: string) => pendingUpdates.has(topicId)
  };
} 