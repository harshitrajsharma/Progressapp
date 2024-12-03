import { useState, useEffect } from 'react';

interface TransitionOptions {
  duration?: number;
  delay?: number;
  immediate?: boolean;
}

export function useSmoothTransition<T>(
  value: T,
  options: TransitionOptions = {}
) {
  const [displayValue, setDisplayValue] = useState<T>(value);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const { immediate = false, delay = 0 } = options;

    // Helper to check if a value is valid
    const isValidValue = (val: any) => {
      if (val === null || val === undefined) return false;
      if (typeof val === 'number' && isNaN(val)) return false;
      if (typeof val === 'object' && val !== null) {
        return Object.values(val).every(v => isValidValue(v));
      }
      return true;
    };

    // Only update if we have valid new values
    if (isValidValue(value)) {
      if (immediate) {
        setDisplayValue(value);
        return;
      }

      setIsTransitioning(true);
      const timeoutId = setTimeout(() => {
        setDisplayValue(value);
        setIsTransitioning(false);
      }, delay);

      return () => clearTimeout(timeoutId);
    }
  }, [value, options]);

  return {
    displayValue,
    isTransitioning,
    // Helper functions
    getTransitionClass: (duration = 300) => 
      `transition-all duration-${duration} ease-out`,
  };
} 