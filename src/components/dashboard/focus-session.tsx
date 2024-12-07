'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronUp, ChevronDown, Play, Pause, Square, Coffee, Timer } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useStudySession, LocalStudySession, StudyMetrics } from "@/hooks/use-study-session";
import { Progress } from "@/components/ui/progress";

interface Subject {
  id: string;
  name: string;
}

interface FocusSessionProps {
  onSessionComplete: (duration: number) => void;
  onSubjectChange: (subject: string) => void;
  onPhaseChange: (phase: string) => void;
}

// Memoized timer display
const TimerDisplay = memo(({ time, progress, isBreak }: { time: string; progress: number; isBreak: boolean }) => (
  <div className="relative w-48 h-48 mx-auto mb-6">
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="font-mono text-4xl">{time}</span>
    </div>
    <svg className="w-full h-full transform -rotate-90">
      <circle
        className="text-gray-200"
        strokeWidth="8"
        stroke="currentColor"
        fill="transparent"
        r="70"
        cx="96"
        cy="96"
      />
      <circle
        className={`${isBreak ? 'text-green-500' : 'text-primary'}`}
        strokeWidth="8"
        strokeDasharray={440}
        strokeDashoffset={440 - (440 * progress) / 100}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r="70"
        cx="96"
        cy="96"
      />
    </svg>
  </div>
));

// Memoized session controls
const SessionControls = memo(({ 
  status, 
  onPause, 
  onResume, 
  onStop 
}: { 
  status: string; 
  onPause: () => void; 
  onResume: () => void; 
  onStop: () => void; 
}) => (
  <div className="flex justify-center space-x-4">
    {status === 'active' ? (
      <Button onClick={onPause} variant="outline">
        <Pause className="w-4 h-4 mr-2" />
        Pause
      </Button>
    ) : (
      <Button onClick={onResume} variant="default">
        <Play className="w-4 h-4 mr-2" />
        Resume
      </Button>
    )}
    <Button onClick={onStop} variant="destructive">
      <Square className="w-4 h-4 mr-2" />
      Stop
    </Button>
  </div>
));

// Memoized break controls
const BreakControls = memo(({ 
  breakType,
  onEndBreak, 
  onSkipBreak 
}: { 
  breakType: string;
  onEndBreak: () => void; 
  onSkipBreak: () => void; 
}) => (
  <div className="space-y-4">
    <div className="text-center text-lg font-medium">
      {breakType === 'long' ? 'Long Break' : 'Short Break'} Time!
    </div>
    <div className="flex justify-center space-x-4">
      <Button onClick={onEndBreak} variant="default">
        <Coffee className="w-4 h-4 mr-2" />
        End Break
      </Button>
      <Button onClick={onSkipBreak} variant="outline">
        <Timer className="w-4 h-4 mr-2" />
        Skip Break
      </Button>
    </div>
  </div>
));

// Memoized metrics display
const MetricsDisplay = memo(({ metrics, formatTime }: { metrics: StudyMetrics; formatTime: (seconds: number) => string }) => (
  <div className="mt-6 space-y-2">
    <div className="flex justify-between text-sm">
      <span>Focus Time:</span>
      <span>{formatTime(metrics.totalFocusTime)}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span>Break Time:</span>
      <span>{formatTime(metrics.breakTime)}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span>Productivity Score:</span>
      <span>{metrics.productivity}%</span>
    </div>
    <div className="flex justify-between text-sm">
      <span>Interruptions:</span>
      <span>{metrics.interruptions}</span>
    </div>
  </div>
));

export function FocusSession({ onSessionComplete, onSubjectChange, onPhaseChange }: FocusSessionProps) {
  const [sessionDuration, setSessionDuration] = useState(240); // 4 hours in minutes
  const [skipBreaks, setSkipBreaks] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedPhase, setSelectedPhase] = useState<string>('learning');
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [breakDuration, setBreakDuration] = useState<number>(0);

  const {
    session,
    displayTime,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    startBreak,
    endBreak,
    skipBreak,
    formatTime,
    shouldTakeBreak,
    getBreakDuration,
    metrics
  } = useStudySession();

  // Calculate number of breaks
  const numberOfBreaks = useMemo(() => 
    skipBreaks ? 0 : Math.floor(sessionDuration / 60)
  , [skipBreaks, sessionDuration]);

  // Format time display
  const formattedTime = useMemo(() => {
    if (typeof formatTime !== 'function') {
      console.error('formatTime is not a function:', formatTime);
      return "00:00:00";
    }
    return formatTime(isBreakTime ? breakDuration : displayTime);
  }, [displayTime, formatTime, isBreakTime, breakDuration]);

  // Calculate progress
  const progress = useMemo(() => {
    if (!session || !session.currentPhase) return 0;
    const total = isBreakTime ? breakDuration : session.currentPhase.duration * 60;
    const remaining = isBreakTime ? breakDuration : displayTime;
    return Math.min(100, ((total - remaining) / total) * 100);
  }, [session, displayTime, isBreakTime, breakDuration]);

  // Load subjects
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await fetch('/api/subjects');
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        console.error('Error loading subjects:', error);
      }
    };
    loadSubjects();
  }, []);

  // Check for break time
  useEffect(() => {
    if (session && shouldTakeBreak(session) && !isBreakTime) {
      const duration = getBreakDuration(session);
      setIsBreakTime(true);
      setBreakDuration(duration);
      startBreak();
    }
  }, [session, shouldTakeBreak, isBreakTime, getBreakDuration, startBreak]);

  // Memoized handlers
  const handleStartSession = useCallback(async () => {
    if (!selectedSubject || !selectedPhase) {
      toast({
        title: "Missing fields",
        description: "Please select a subject and study phase.",
        variant: "destructive"
      });
      return;
    }

    const success = await startSession(
      selectedSubject,
      selectedPhase,
      sessionDuration,
      skipBreaks
    );

    if (success) {
      toast({
        title: "Focus session started",
        description: "Stay focused and productive! 💪"
      });
    }
  }, [selectedSubject, selectedPhase, sessionDuration, skipBreaks, startSession]);

  const handleEndBreak = useCallback(async () => {
    const success = await endBreak();
    if (success) {
      setIsBreakTime(false);
      setBreakDuration(0);
    }
  }, [endBreak]);

  const handleSkipBreak = useCallback(async () => {
    const success = await skipBreak();
    if (success) {
      setIsBreakTime(false);
      setBreakDuration(0);
    }
  }, [skipBreak]);

  const handleSubjectChange = useCallback((value: string) => {
    setSelectedSubject(value);
    onSubjectChange(value);
  }, [onSubjectChange]);

  const handlePhaseChange = useCallback((value: string) => {
    setSelectedPhase(value);
    onPhaseChange(value);
  }, [onPhaseChange]);

  const handleDurationChange = useCallback((change: number) => {
    setSessionDuration(prev => Math.max(30, Math.min(480, prev + change)));
  }, []);

  return (
    <Card>
      <CardContent className="p-6">
        {session ? (
          <div>
            <TimerDisplay
              time={formattedTime}
              progress={progress}
              isBreak={isBreakTime}
            />

            <div className="space-y-4">
              {isBreakTime ? (
                <BreakControls
                  breakType={breakDuration === getBreakDuration(session) ? 'long' : 'short'}
                  onEndBreak={handleEndBreak}
                  onSkipBreak={handleSkipBreak}
                />
              ) : (
                <SessionControls
                  status={session.status}
                  onPause={pauseSession}
                  onResume={resumeSession}
                  onStop={stopSession}
                />
              )}

              {metrics && (
                <MetricsDisplay metrics={metrics} formatTime={formatTime} />
              )}
            </div>
          </div>
        ) : (
          // Session setup UI
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Subject</Label>
                <Select value={selectedSubject} onValueChange={handleSubjectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Study Phase</Label>
                <Select value={selectedPhase} onValueChange={handlePhaseChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="revision">Revision</SelectItem>
                    <SelectItem value="practice">Practice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Session Duration</Label>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDurationChange(-30)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <span className="flex-1 text-center">
                    {Math.floor(sessionDuration / 60)}h {sessionDuration % 60}m
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDurationChange(30)}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skipBreaks"
                  checked={skipBreaks}
                  onCheckedChange={(checked) => setSkipBreaks(checked as boolean)}
                />
                <Label htmlFor="skipBreaks">Skip breaks ({numberOfBreaks} breaks)</Label>
              </div>

              <Button className="w-full" onClick={handleStartSession}>
                <Play className="w-4 h-4 mr-2" />
                Start Session
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 