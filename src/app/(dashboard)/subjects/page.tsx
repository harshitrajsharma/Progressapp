'use client';

import { Suspense, useEffect } from "react";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { AddSubjectButton } from "@/components/subjects/add-subject-button";
import { SubjectCard } from "@/components/subjects/subject-card";
import { SubjectCardSkeleton } from "@/components/subjects/subject-card-skeleton";
import { SearchSubjects } from "@/components/subjects/search-subjects";
import { SubjectWithRelations } from "@/types/prisma/subject";
import { calculateSubjectProgress } from "@/lib/calculations";
import { useSubjects } from "@/hooks/use-subjects";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSubjectReorder } from '@/hooks/use-subject-reorder'
import { useState, useMemo } from 'react'

type SubjectCategory = 'not-started' | 'in-progress' | 'completed';

interface CategorizedSubjects {
  notStarted: SubjectWithRelations[];
  inProgress: SubjectWithRelations[];
  completed: SubjectWithRelations[];
}

interface SubjectsGridProps {
  searchQuery: string;
}

function SubjectsGrid({ searchQuery }: SubjectsGridProps) {
  const { subjects, error, isLoading } = useSubjects();
  const { handleReorder } = useSubjectReorder();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [categorizedSubjects, setCategorizedSubjects] = useState<CategorizedSubjects>({
    notStarted: [],
    inProgress: [],
    completed: []
  });

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id || !subjects) return;

    const oldIndex = subjects.findIndex((s) => s.id === active.id);
    const newIndex = subjects.findIndex((s) => s.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      handleReorder(oldIndex, newIndex, subjects);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Filter subjects based on search query
  const filteredSubjects = useMemo(() => {
    if (!subjects) return [];
    if (!searchQuery.trim()) return subjects;

    const query = searchQuery.toLowerCase();
    return subjects.filter(subject => 
      subject.name.toLowerCase().includes(query)
    );
  }, [subjects, searchQuery]);

  // Update categorized subjects when filtered subjects change
  useEffect(() => {
    if (!filteredSubjects) return;
    
    const categorized = filteredSubjects.reduce((acc, subject) => {
      const progress = calculateSubjectProgress(subject);
      const learningProgress = progress.learning;

      if (learningProgress === 0) {
        acc.notStarted.push(subject);
      } else if (learningProgress === 100) {
        acc.completed.push(subject);
      } else {
        acc.inProgress.push(subject);
      }

      return acc;
    }, {
      notStarted: [] as SubjectWithRelations[],
      inProgress: [] as SubjectWithRelations[],
      completed: [] as SubjectWithRelations[]
    });

    setCategorizedSubjects(categorized);
  }, [filteredSubjects]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-6 text-destructive gap-2">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load subjects</span>
      </div>
    );
  }

  if (isLoading || !subjects) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <SubjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-muted-foreground gap-2">
        <span>No subjects found. Add your first subject to get started!</span>
      </div>
    );
  }

  const activeSubject = subjects.find(s => s.id === activeId);

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd} 
      onDragCancel={handleDragCancel}
    >
      <div className="space-y-6 sm:space-y-8">
        {/* In Progress Section */}
        {categorizedSubjects.inProgress.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <h3 className="text-xl font-bold text-blue-500">In Progress</h3>
            </div>
            <SortableContext 
              items={categorizedSubjects.inProgress.map(s => s.id)} 
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categorizedSubjects.inProgress.map((subject) => (
                  <SubjectCard 
                    key={subject.id} 
                    subject={subject} 
                    category="in-progress"
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        )}

        {/* Not Started Section */}
        {categorizedSubjects.notStarted.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <h3 className="text-xl font-bold text-red-500">Not Started</h3>
            </div>
            <SortableContext items={categorizedSubjects.notStarted.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categorizedSubjects.notStarted.map((subject) => (
                  <SubjectCard key={subject.id} subject={subject} category="not-started" />
                ))}
              </div>
            </SortableContext>
          </div>
        )}

        {/* Completed Section */}
        {categorizedSubjects.completed.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h3 className="text-xl font-bold text-green-500">Completed</h3>
            </div>
            <SortableContext items={categorizedSubjects.completed.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categorizedSubjects.completed.map((subject) => (
                  <SubjectCard key={subject.id} subject={subject} category="completed" />
                ))}
              </div>
            </SortableContext>
          </div>
        )}
      </div>

      <DragOverlay>
        {activeId && activeSubject ? (
          <SubjectCard 
            subject={activeSubject} 
            category={getSubjectCategory(activeSubject)}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function getSubjectCategory(subject: SubjectWithRelations): SubjectCategory {
  const progress = calculateSubjectProgress(subject);
  const learningProgress = progress.learning;

  if (learningProgress === 0) return 'not-started';
  if (learningProgress === 100) return 'completed';
  return 'in-progress';
}

export default function SubjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleSearch = (e: CustomEvent<string>) => {
      setSearchQuery(e.detail);
    };

    window.addEventListener('subjectSearch', handleSearch as EventListener);
    return () => window.removeEventListener('subjectSearch', handleSearch as EventListener);
  }, []);

  return (
    <div className="h-full flex-1 flex-col space-y-6 sm:space-y-8 p-2 sm:p-4 flex">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
        <p className="text-muted-foreground">
          Manage your GATE CSE 2025 subjects and track progress
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 w-full">
        <SearchSubjects />
        <div className="scale-90 sm:scale-100">
          <AddSubjectButton />
        </div>
      </div>

      <Suspense fallback={
        <div className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <SubjectCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }>
        <SubjectsGrid searchQuery={searchQuery} />
      </Suspense>
    </div>
  );
} 