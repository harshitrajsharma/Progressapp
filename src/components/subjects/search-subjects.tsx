'use client';

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface SearchSubjectsProps {
  onSearch: (query: string) => void;
}

export function SearchSubjects({ onSearch }: SearchSubjectsProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search subjects..."
        className="pl-9 w-full"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  )
} 