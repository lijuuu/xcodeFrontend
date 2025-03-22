import { useState, useEffect } from 'react';
import { Clock, TimerReset } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from "react";


interface TimerProps {
  className?: string;
}

const Timer = ({ className }: TimerProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval: number | null = null;
    
    if (timerActive) {
      interval = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setTimerActive(true);
  };

  const clearTimer = () => {
    setTimerActive(false);
    setElapsedTime(0);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1 text-sm text-editor-text">
        <Clock className="h-4 w-4 text-emerald-400" />
        <span>{formatTime(elapsedTime)}</span>
      </div>
      <div className="flex gap-1">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={startTimer} 
          className="h-7 px-2 text-xs"
          disabled={timerActive}
        >
          Start
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearTimer} 
          className="h-7 px-2 text-xs"
        >
          <TimerReset className="h-3.5 w-3.5 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  );
};

export default Timer;