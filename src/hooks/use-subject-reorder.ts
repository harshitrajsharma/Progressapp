import { useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { toast } from 'sonner'
import { mutate } from 'swr'

export const useSubjectReorder = () => {
  const [isPending, setIsPending] = useState(false)

  const handleReorder = async (oldIndex: number, newIndex: number, subjects: any[]) => {
    if (oldIndex === newIndex) return

    setIsPending(true)
    const optimisticSubjects = arrayMove(subjects, oldIndex, newIndex)
    
    // Update positions based on new order
    const updatedSubjects = optimisticSubjects.map((subject, index) => ({
      id: subject.id,
      position: index,
    }))

    // Optimistically update the UI
    mutate('/api/subjects', optimisticSubjects, false)

    try {
      const response = await fetch('/api/subjects/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subjects: updatedSubjects }),
      })

      if (!response.ok) {
        throw new Error('Failed to reorder subjects')
      }

      // Revalidate after successful update
      mutate('/api/subjects')
      toast.success('Subjects reordered successfully')
    } catch (error) {
      // Revert optimistic update on error
      mutate('/api/subjects')
      toast.error('Failed to reorder subjects')
      console.error('Error reordering subjects:', error)
    } finally {
      setIsPending(false)
    }
  }

  return {
    handleReorder,
    isPending,
  }
} 