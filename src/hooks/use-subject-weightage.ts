import { Subject } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"

export function useSubjectWeightage() {
  return useQuery<Subject[]>({
    queryKey: ['subjects', 'weightage'],
    queryFn: async () => {
      const response = await fetch('/api/subjects/weightage')
      if (!response.ok) {
        throw new Error('Failed to fetch subject weightage')
      }
      return response.json()
    }
  })
} 