import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from './use-toast';

// Constants
const STORAGE_KEY = 'study_session';
const SYNC_INTERVAL = 60 * 1000; // 1 minute
const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes in seconds
const LONG_BREAK_DURATION = 15 * 60; // 15 minutes in seconds
const SESSIONS_BEFORE_LONG_BREAK = 4;
const MIN_FOCUS_DURATION = 25 * 60; // 25 minutes in seconds

export interface StudyBreak {
  startTime: number;
  endTime?: number;
  type: 'short' | 'long';
  wasTimely: boolean;
}

export interface StudyMetrics {
  totalFocusTime: number;
  breakTime: number;
  interruptions: number;
  productivity: number;
}

export interface LocalStudySession {
  id?: string;
  subjectId: string;
  phaseType: string;
  startTime: number;
  duration: number;
  status: 'active' | 'paused' | 'completed';
  currentPhase: {
    type: string;
    startTime: number;
    duration: number;
    isActive: boolean;
  };
  breaks: StudyBreak[];
  metrics: StudyMetrics;
  skipBreaks: boolean;
  pausedAt?: number;
  pausedDuration: number;
  lastSyncTime: number;
  offlineChanges?: boolean;
}

export const useStudySession = () => {
  const [session, setSession] = useState<LocalStudySession | null>(null);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [displayTime, setDisplayTime] = useState<number>(0);
  const syncIntervalRef = useRef<NodeJS.Timeout>();
  const timerIntervalRef = useRef<NodeJS.Timeout>();
  const syncInProgressRef = useRef(false);

  // Format time for display
  const formatTime = useCallback((seconds: number): string => {
    if (typeof seconds !== 'number' || isNaN(seconds)) return "00:00:00";
    const hours = Math.floor(Math.max(0, seconds) / 3600);
    const minutes = Math.floor((Math.max(0, seconds) % 3600) / 60);
    const remainingSeconds = Math.max(0, seconds) % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Calculate remaining time
  const calculateRemainingTime = useCallback((currentSession: LocalStudySession | null): number => {
    if (!currentSession || !currentSession.currentPhase) return 0;
    const { startTime, duration } = currentSession.currentPhase;
    const now = new Date();
    
    if (currentSession.status === 'paused') {
      return Math.max(0, duration * 60 - currentSession.pausedDuration);
    }
    
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    return Math.max(0, duration * 60 - elapsed - currentSession.pausedDuration);
  }, []);

  // Update timer
  const updateTimer = useCallback(() => {
    if (!session || session.status !== 'active') return;
    const remaining = calculateRemainingTime(session);
    setDisplayTime(remaining);
  }, [session, calculateRemainingTime]);

  // Start timer
  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    updateTimer();
    timerIntervalRef.current = setInterval(updateTimer, 1000);
  }, [updateTimer]);

  // Stop timer
  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = undefined;
    }
  }, []);

  // Check if it's time for a break
  const shouldTakeBreak = useCallback((currentSession: LocalStudySession): boolean => {
    if (!currentSession || currentSession.status !== 'active' || currentSession.skipBreaks) return false;
    
    const now = new Date();
    const lastBreak = currentSession.breaks[currentSession.breaks.length - 1];
    const timeSinceLastBreak = lastBreak 
      ? now.getTime() - (lastBreak.endTime || now).getTime() 
      : now.getTime() - currentSession.startTime.getTime();
    
    return timeSinceLastBreak >= MIN_FOCUS_DURATION * 1000;
  }, []);

  // Get break duration
  const getBreakDuration = useCallback((currentSession: LocalStudySession): number => {
    const completedSessions = currentSession.breaks.filter(b => b.wasTimely).length;
    return completedSessions > 0 && completedSessions % SESSIONS_BEFORE_LONG_BREAK === 0
      ? LONG_BREAK_DURATION
      : SHORT_BREAK_DURATION;
  }, []);

  // Handle offline changes
  const handleOfflineChange = useCallback((change: any) => {
    setOfflineQueue(prev => [...prev, { ...change, timestamp: new Date() }]);
    localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Update session with proper timer handling
  const updateSession = useCallback((updater: (prev: LocalStudySession | null) => LocalStudySession | null) => {
    setSession(prev => {
      const newSession = updater(prev);
      if (newSession?.status === 'active') {
        startTimer();
      } else {
        stopTimer();
      }
      return newSession;
    });
  }, [startTimer, stopTimer]);

  // Sync with server
  const syncWithServer = useCallback(async (forceSync = false) => {
    if (!session || syncInProgressRef.current) return;

    const now = Date.now();
    const timeSinceLastSync = now - session.lastSyncTime;

    // Only sync if forced or enough time has passed
    if (!forceSync && timeSinceLastSync < SYNC_INTERVAL) return;

    try {
      syncInProgressRef.current = true;

      // First try to sync any offline changes
      if (offlineQueue.length > 0) {
        await Promise.all(offlineQueue.map(async (change) => {
          try {
            await fetch('/api/study-time/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(change)
            });
          } catch (error) {
            console.error('Failed to sync offline change:', error);
          }
        }));
        setOfflineQueue([]);
        localStorage.removeItem('offlineQueue');
      }

      // Then sync current session
      const response = await fetch('/api/study-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          sessionId: session.id,
          status: session.status,
          metrics: session.metrics,
          breaks: session.breaks,
          currentPhase: session.currentPhase
        })
      });

      if (!response.ok) throw new Error('Failed to sync session');

      const data = await response.json();
      setSession(prev => prev ? {
        ...prev,
        id: data.focusSession.id,
        lastSyncTime: now
      } : null);
    } catch (error) {
      console.error('Error syncing session:', error);
      handleOfflineChange({
        action: 'sync',
        session: session
      });
    } finally {
      syncInProgressRef.current = false;
    }
  }, [session, offlineQueue, handleOfflineChange]);

  // Load session from localStorage
  useEffect(() => {
    const loadSession = () => {
      const storedSession = localStorage.getItem(STORAGE_KEY);
      const storedQueue = localStorage.getItem('offlineQueue');
      
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession, (key, value) => {
          if (key === 'startTime' || key === 'pausedAt' || key === 'lastSyncTime' || 
              key === 'endTime' || key === 'lastBreakAt') {
            return value ? new Date(value) : null;
          }
          return value;
        });
        
        if (parsedSession.startTime.getDate() !== new Date().getDate()) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }
        updateSession(() => parsedSession);
      }
      
      if (storedQueue) {
        setOfflineQueue(JSON.parse(storedQueue));
      }
    };

    loadSession();
    window.addEventListener('online', () => syncWithServer(true));
    return () => {
      window.removeEventListener('online', () => syncWithServer(true));
      stopTimer();
    };
  }, [syncWithServer, updateSession, stopTimer]);

  // Save session to localStorage
  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      stopTimer();
    }
  }, [session, stopTimer]);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  // Start timer when session becomes active
  useEffect(() => {
    if (session?.status === 'active') {
      startTimer();
    } else {
      stopTimer();
    }
  }, [session?.status, startTimer, stopTimer]);

  // Start a new session
  const startSession = useCallback(async (
    subjectId: string,
    phaseType: string,
    duration: number,
    skipBreaks: boolean
  ) => {
    try {
      const response = await fetch('/api/study-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          subjectId,
          phaseType,
          duration,
          skipBreaks,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          deviceId: localStorage.getItem('deviceId') || crypto.randomUUID()
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const { focusSession } = await response.json();
      const now = Date.now();
      
      const newSession: LocalStudySession = {
        id: focusSession.id,
        subjectId,
        phaseType,
        startTime: now,
        duration,
        status: 'active',
        currentPhase: {
          type: phaseType,
          startTime: now,
          duration,
          isActive: true
        },
        breaks: [],
        metrics: {
          totalFocusTime: 0,
          breakTime: 0,
          interruptions: 0,
          productivity: 0
        },
        skipBreaks,
        pausedDuration: 0,
        lastSyncTime: now
      };

      setSession(newSession);
      localStorage.setItem('deviceId', focusSession.deviceId);
      return true;
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Failed to start session",
        description: "Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, []);

  // Start a break
  const startBreak = useCallback(async () => {
    if (!session || session.status !== 'active') return false;

    try {
      const now = Date.now();
      const breakDuration = getBreakDuration(session);

      const response = await fetch('/api/study-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start-break',
          sessionId: session.id,
          breakType: breakDuration === LONG_BREAK_DURATION ? 'long' : 'short'
        })
      });

      if (!response.ok) throw new Error('Failed to start break');

      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          breaks: [...prev.breaks, {
            startTime: now,
            type: breakDuration === LONG_BREAK_DURATION ? 'long' : 'short',
            wasTimely: true
          }],
          lastSyncTime: now
        };
      });

      return true;
    } catch (error) {
      console.error('Error starting break:', error);
      handleOfflineChange({
        action: 'start-break',
        sessionId: session.id,
        timestamp: Date.now()
      });
      return false;
    }
  }, [session, getBreakDuration, handleOfflineChange]);

  // End a break
  const endBreak = useCallback(async () => {
    if (!session || session.status !== 'active') return false;

    try {
      const now = Date.now();
      const currentBreak = session.breaks[session.breaks.length - 1];

      if (!currentBreak) return false;

      const response = await fetch('/api/study-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end-break',
          sessionId: session.id,
          breakId: currentBreak.startTime
        })
      });

      if (!response.ok) throw new Error('Failed to end break');

      setSession(prev => {
        if (!prev) return null;
        const breaks = [...prev.breaks];
        const lastBreak = breaks[breaks.length - 1];
        if (lastBreak) {
          lastBreak.endTime = now;
        }
        return {
          ...prev,
          breaks,
          metrics: {
            ...prev.metrics,
            breakTime: prev.metrics.breakTime + Math.floor((now - currentBreak.startTime) / 1000)
          },
          lastSyncTime: now
        };
      });

      return true;
    } catch (error) {
      console.error('Error ending break:', error);
      handleOfflineChange({
        action: 'end-break',
        sessionId: session.id,
        timestamp: Date.now()
      });
      return false;
    }
  }, [session, handleOfflineChange]);

  // Skip a break
  const skipBreak = useCallback(async () => {
    if (!session || session.status !== 'active') return false;

    try {
      const now = Date.now();
      const currentBreak = session.breaks[session.breaks.length - 1];

      if (!currentBreak) return false;

      const response = await fetch('/api/study-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'skip-break',
          sessionId: session.id,
          breakId: currentBreak.startTime
        })
      });

      if (!response.ok) throw new Error('Failed to skip break');

      setSession(prev => {
        if (!prev) return null;
        const breaks = [...prev.breaks];
        const lastBreak = breaks[breaks.length - 1];
        if (lastBreak) {
          lastBreak.endTime = now;
          lastBreak.wasTimely = false;
        }
        return {
          ...prev,
          breaks,
          metrics: {
            ...prev.metrics,
            interruptions: prev.metrics.interruptions + 1
          },
          lastSyncTime: now
        };
      });

      return true;
    } catch (error) {
      console.error('Error skipping break:', error);
      handleOfflineChange({
        action: 'skip-break',
        sessionId: session.id,
        timestamp: Date.now()
      });
      return false;
    }
  }, [session, handleOfflineChange]);

  // Pause session
  const pauseSession = useCallback(async () => {
    if (!session?.status === 'active' || !session.id) return false;

    try {
      const now = Date.now();

      const response = await fetch('/api/study-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pause',
          sessionId: session.id
        })
      });

      if (!response.ok) throw new Error('Failed to pause session');

      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'paused',
          pausedAt: now,
          metrics: {
            ...prev.metrics,
            interruptions: prev.metrics.interruptions + 1
          }
        };
      });

      return true;
    } catch (error) {
      console.error('Error pausing session:', error);
      handleOfflineChange({
        action: 'pause',
        sessionId: session.id,
        timestamp: Date.now()
      });
      return false;
    }
  }, [session, handleOfflineChange]);

  // Resume session
  const resumeSession = useCallback(async () => {
    if (!session || session.status === 'active' || !session.id || !session.pausedAt) return false;

    try {
      const now = Date.now();

      const response = await fetch('/api/study-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resume',
          sessionId: session.id
        })
      });

      if (!response.ok) throw new Error('Failed to resume session');

      setSession(prev => {
        if (!prev || !prev.pausedAt) return prev;
        return {
          ...prev,
          status: 'active',
          pausedDuration: prev.pausedDuration + (now - prev.pausedAt),
          pausedAt: undefined,
          lastSyncTime: now
        };
      });

      return true;
    } catch (error) {
      console.error('Error resuming session:', error);
      handleOfflineChange({
        action: 'resume',
        sessionId: session.id,
        timestamp: Date.now()
      });
      return false;
    }
  }, [session, handleOfflineChange]);

  // Stop session
  const stopSession = useCallback(async () => {
    if (!session?.id) return false;

    try {
      const now = Date.now();
      const totalFocusTime = Math.floor(
        (now - session.startTime - session.pausedDuration - 
          session.breaks.reduce((total, b) => total + ((b.endTime || now) - b.startTime), 0)
        ) / 1000
      );

      const productivity = Math.round(
        (totalFocusTime / (session.duration * 60)) * 
        (1 - (session.metrics.interruptions * 0.1)) * 
        100
      );

      const finalMetrics = {
        ...session.metrics,
        totalFocusTime,
        productivity: Math.max(0, Math.min(100, productivity))
      };

      const response = await fetch('/api/study-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stop',
          sessionId: session.id,
          metrics: finalMetrics,
          breaks: session.breaks,
          pausedDuration: session.pausedDuration
        })
      });

      if (!response.ok) throw new Error('Failed to stop session');

      const data = await response.json();

      // Format completion message
      const hours = Math.floor(totalFocusTime / 3600);
      const minutes = Math.floor((totalFocusTime % 3600) / 60);
      const timeMessage = hours > 0 
        ? `${hours}h ${minutes}m`
        : `${minutes} minutes`;

      toast({
        title: "Focus session completed",
        description: `Great work! You studied for ${timeMessage} with ${finalMetrics.productivity}% productivity! 🎉`,
      });

      localStorage.removeItem(STORAGE_KEY);
      setSession(null);
      return true;

    } catch (error) {
      console.error('Error stopping session:', error);
      handleOfflineChange({
        action: 'stop',
        sessionId: session.id,
        timestamp: Date.now()
      });
      return false;
    }
  }, [session, handleOfflineChange]);

  return {
    session,
    displayTime,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    startBreak,
    endBreak,
    skipBreak,
    calculateRemainingTime,
    formatTime,
    shouldTakeBreak,
    getBreakDuration,
    metrics: session?.metrics
  };
}; 