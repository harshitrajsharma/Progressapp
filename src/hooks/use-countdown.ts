'use client';

import { useState, useEffect } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

interface CountdownData {
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
  secondsLeft: number;
  progressPercentage: number;
}

export function useCountdown(examDate: Date) {
  const [countdown, setCountdown] = useState<CountdownData>({
    daysLeft: 0,
    hoursLeft: 0,
    minutesLeft: 0,
    secondsLeft: 0,
    progressPercentage: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const exam = new Date(examDate);

      // Calculate time differences
      const daysLeft = differenceInDays(exam, now);
      const hoursLeft = differenceInHours(exam, now) % 24;
      const minutesLeft = differenceInMinutes(exam, now) % 60;
      const secondsLeft = differenceInSeconds(exam, now) % 60;

      // Calculate progress percentage
      const startDate = new Date(exam);
      startDate.setMonth(startDate.getMonth() - 12); // Assuming 1 year prep
      const totalDays = 365;
      const daysCompleted = totalDays - daysLeft;
      const progressPercentage = Math.min(100, Math.max(0, (daysCompleted / totalDays) * 100));

      return {
        daysLeft,
        hoursLeft,
        minutesLeft,
        secondsLeft,
        progressPercentage
      };
    };

    // Initial calculation
    setCountdown(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setCountdown(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [examDate]);

  return countdown;
} 