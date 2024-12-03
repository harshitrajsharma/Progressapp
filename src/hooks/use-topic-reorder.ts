import { useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { useToast } from '@/hooks/use-toast';

export const useTopicReorder = (chapterId: string) => {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const handleReorder = async (oldIndex: number, newIndex: number, topics: any[]) => {
    if (oldIndex === newIndex) return;

    setIsPending(true);
    const topicToMove = topics[oldIndex];
    const optimisticTopics = arrayMove(topics, oldIndex, newIndex);

    try {
      const response = await fetch(`/api/chapters/${chapterId}/topics/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId: topicToMove.id,
          newIndex
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder topics');
      }

      const updatedTopics = await response.json();
      toast({
        title: "Success",
        description: "Topics reordered successfully",
        className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
      });
      return updatedTopics;
    } catch (error) {
      console.error('Error reordering topics:', error);
      toast({
        title: "Error",
        description: "Failed to reorder topics",
        variant: "destructive",
      });
      return topics;
    } finally {
      setIsPending(false);
    }
  };

  return {
    handleReorder,
    isPending,
  };
}; 