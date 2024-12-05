import { useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { useToast } from '@/hooks/use-toast';
import { BaseTopic } from '@/types/prisma/topic';
import { convertDates } from '@/lib/utils/dates';

export const useTopicReorder = (chapterId: string) => {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const handleReorder = async (oldIndex: number, newIndex: number, topics: BaseTopic[]) => {
    if (oldIndex === newIndex) return null;

    setIsPending(true);
    const topicToMove = topics[oldIndex];
    const newTopics = arrayMove(topics, oldIndex, newIndex);
    
    // Calculate new positions
    const updatedTopics = newTopics.map((topic, index) => ({
      ...topic,
      position: index
    }));

    try {
      const response = await fetch(`/api/chapters/${chapterId}/topics/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId: topicToMove.id,
          newPosition: newIndex,
          positions: updatedTopics.map(t => ({ id: t.id, position: t.position }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder topics');
      }

      const data = await response.json();
      
      // Convert dates and ensure positions are correct
      const serverTopics = data.map((topic: any) => 
        convertDates({
          ...topic,
          position: updatedTopics.find(t => t.id === topic.id)?.position ?? topic.position
        }, ['lastRevised', 'nextRevision', 'createdAt', 'updatedAt'])
      );

      // Sort by position to ensure correct order
      const sortedTopics = [...serverTopics].sort((a, b) => a.position - b.position);

      toast({
        title: "Success",
        description: "Topics reordered successfully",
        className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
      });

      return sortedTopics;
    } catch (error) {
      console.error('Error reordering topics:', error);
      toast({
        title: "Error",
        description: "Failed to reorder topics",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return {
    handleReorder,
    isPending,
  };
}; 