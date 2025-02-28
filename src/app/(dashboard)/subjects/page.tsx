'use client';

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { AddSubjectButton } from "@/components/subjects/add-subject-button";
import { SubjectCard } from "@/components/subjects/subject-card";
import { SubjectCardSkeleton } from "@/components/subjects/subject-card-skeleton";
import { SearchSubjects } from "@/components/subjects/search-subjects";
import { SubjectWithRelations } from "@/types/prisma/subject";
import { calculateSubjectProgress } from "@/lib/calculations";
import { useSubjects } from "@/hooks/use-subjects";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSubjectReorder } from '@/hooks/use-subject-reorder';
import { SmartRecommendations } from "@/components/recommendations/smart-recommendations";
import { motion, AnimatePresence } from 'framer-motion';

type SubjectCategory = 'not-started' | 'in-progress' | 'completed';

interface CategorizedSubjects {
  notStarted: SubjectWithRelations[];
  inProgress: SubjectWithRelations[];
  completed: SubjectWithRelations[];
}

interface SubjectsGridProps {
  searchQuery: string;
  activeTab: SubjectCategory | 'all';
}

function SubjectsGrid({ searchQuery, activeTab }: SubjectsGridProps) {
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
      } else if (learningProgress >= 90) {
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
      <div className="flex items-center justify-center p-6 text-red-500 gap-2">
        <AlertCircle className="h-5 w-5" />
        <span>Failed to load subjects</span>
      </div>
    );
  }

  if (isLoading || !subjects) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <SubjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-gray-500 dark:text-gray-400 gap-2">
        <span>No subjects found. Add your first subject to get started!</span>
      </div>
    );
  }

  const activeSubject = subjects.find(s => s.id === activeId);

  // Render section with animation
  const renderSection = (category: SubjectCategory, subjects: SubjectWithRelations[], icon: React.ReactNode, title: string, titleColor: string) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        {icon}
        <h3 className={`text-lg font-semibold ${titleColor}`}>{title}</h3>
      </div>
      <SortableContext
        items={subjects.map(s => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <SubjectCard
                subject={subject}
                category={category}
              />
            </motion.div>
          ))}
        </div>
      </SortableContext>
    </motion.div>
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {activeTab === 'all' ? (
            <>
              {categorizedSubjects.inProgress.length > 0 && renderSection(
                'in-progress',
                categorizedSubjects.inProgress,
                <Clock className="h-5 w-5 text-blue-500" />,
                "In Progress",
                "text-blue-500"
              )}
              {categorizedSubjects.notStarted.length > 0 && renderSection(
                'not-started',
                categorizedSubjects.notStarted,
                <AlertCircle className="h-5 w-5 text-red-500" />,
                "Not Started",
                "text-red-500"
              )}
              {categorizedSubjects.completed.length > 0 && renderSection(
                'completed',
                categorizedSubjects.completed,
                <CheckCircle2 className="h-5 w-5 text-green-500" />,
                "Completed",
                "text-green-500"
              )}
              {categorizedSubjects.inProgress.length === 0 &&
                categorizedSubjects.notStarted.length === 0 &&
                categorizedSubjects.completed.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-6 text-gray-500 dark:text-gray-400 gap-2">
                    <span>No subjects found in any category.</span>
                  </div>
                )}
            </>
          ) : (
            (() => {
              const subjectsToShow = activeTab === 'in-progress'
                ? categorizedSubjects.inProgress
                : activeTab === 'not-started'
                  ? categorizedSubjects.notStarted
                  : categorizedSubjects.completed;

              const icon = activeTab === 'in-progress'
                ? <Clock className="h-5 w-5 text-blue-500" />
                : activeTab === 'not-started'
                  ? <AlertCircle className="h-5 w-5 text-red-500" />
                  : <CheckCircle2 className="h-5 w-5 text-green-500" />;

              const title = activeTab === 'in-progress'
                ? "In Progress"
                : activeTab === 'not-started'
                  ? "Not Started"
                  : "Completed";

              const titleColor = activeTab === 'in-progress'
                ? "text-blue-500"
                : activeTab === 'not-started'
                  ? "text-red-500"
                  : "text-green-500";

              return subjectsToShow.length > 0 ? (
                renderSection(activeTab, subjectsToShow, icon, title, titleColor)
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-gray-500 dark:text-gray-400 gap-2">
                  <span>No subjects found in this category.</span>
                </div>
              );
            })()
          )}
        </motion.div>
      </AnimatePresence>

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
  if (learningProgress >= 90) return 'completed';
  return 'in-progress';
}

export default function SubjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SubjectCategory | 'all'>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { subjects } = useSubjects();
  const { data: session } = useSession();

  useEffect(() => {
    const handleSearch = (e: CustomEvent<string>) => {
      setSearchQuery(e.detail);
    };

    window.addEventListener('subjectSearch', handleSearch as EventListener);
    return () => window.removeEventListener('subjectSearch', handleSearch as EventListener);
  }, []);

  const tabOptions = [
    { label: 'All', value: 'all' as const, icon: null },
    { label: 'In Progress', value: 'in-progress' as const, icon: <Clock className="h-5 w-5" /> },
    { label: 'Not Started', value: 'not-started' as const, icon: <AlertCircle className="h-5 w-5" /> },
    { label: 'Completed', value: 'completed' as const, icon: <CheckCircle2 className="h-5 w-5" /> },
  ];

  const getTabColorClass = (value: SubjectCategory | 'all') => {
    switch (value) {
      case 'all':
        return 'bg-black text-white dark:bg-white dark:text-gray-900';
      case 'in-progress':
        return 'bg-blue-500 text-white';
      case 'not-started':
        return 'bg-red-500 text-white';
      case 'completed':
        return 'bg-green-500 text-white';
      default:
        return '';
    }
  };

  const currentTab = tabOptions.find(tab => tab.value === activeTab) || tabOptions[0];

  return (
    <div className="min-h-screen flex-1 flex-col space-y-6 md:p-4 flex">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Subjects
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your {session?.user?.examName || "exam"} subjects and track progress
        </p>
      </div>

      {/* Smart Recommendations */}
      {subjects && subjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <SmartRecommendations subjects={subjects} />
        </motion.div>
      )}

      {/* Navigation and Controls */}
      <div className="space-y-3 sm:space-y-0">
        {/* Mobile: Dropdown Menu with Search and Add Button */}
        <div className="sm:hidden flex flex-col-reverse gap-4">
          {/* Dropdown Menu */}
          <div className="relative z-10 flex-1">
            <motion.button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              whileTap={{ scale: 0.95 }}
              className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-full font-medium ${getTabColorClass(activeTab)}`}
            >
              <div className="flex items-center gap-2">
                {currentTab.icon}
                <span className="text-sm">{currentTab.label}</span>
              </div>
              {isDropdownOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </motion.button>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="absolute left-0 right-0 mt-2 max-h-[60vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 z-20"
                  style={{ top: 'calc(100% + 0.5rem)' }}
                >
                  {tabOptions.map((tab) => (
                    <motion.button
                      key={tab.value}
                      onClick={() => {
                        setActiveTab(tab.value);
                        setIsDropdownOpen(false);
                      }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-full flex items-center gap-3 px-4 py-4 text-base font-medium border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${activeTab === tab.value
                          ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-64">
              <SearchSubjects />
            </div>
            <AddSubjectButton />
          </div>
        </div>

        {/* Desktop: Inline Tabs with Search and Add Button */}
        <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-3">
          <div className="flex flex-row space-x-3 overflow-x-auto sm:overflow-visible pb-2">
            {tabOptions.map((tab) => (
              <motion.button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 min-w-[120px] sm:min-w-0 ${activeTab === tab.value
                    ? getTabColorClass(tab.value)
                    : 'bg-transparent text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-64">
              <SearchSubjects />
            </div>
            <AddSubjectButton />
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <SubjectCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <div className="pb-4 sm:pb-0">
          <SubjectsGrid searchQuery={searchQuery} activeTab={activeTab} />
        </div>
      </Suspense>
    </div>
  );
}