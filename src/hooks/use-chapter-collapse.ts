import { useState, useEffect } from 'react';

export function useChapterCollapse(chapterId: string) {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(`chapter-${chapterId}-collapsed`);
      // If there's no saved state, keep it collapsed (default)
      if (savedState !== null) {
        setIsCollapsed(savedState === 'true');
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, [chapterId]);

  const toggleCollapse = () => {
    try {
      const newState = !isCollapsed;
      setIsCollapsed(newState);
      localStorage.setItem(`chapter-${chapterId}-collapsed`, String(newState));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return {
    isCollapsed,
    toggleCollapse
  };
} 