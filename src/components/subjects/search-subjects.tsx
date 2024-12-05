'use client';

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useCallback, useState } from "react";

export function SearchSubjects() {
  const [query, setQuery] = useState("");

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    window.dispatchEvent(new CustomEvent('subjectSearch', { detail: value }));
  }, []);

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search subjects..."
        className="pl-9 w-full"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  )
} 