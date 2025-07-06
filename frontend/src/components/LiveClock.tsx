import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex items-center justify-center mb-6 p-4 bg-card rounded-lg border border-border">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className="h-6 w-6 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Current Time</span>
        </div>
        <div className="text-3xl font-bold text-foreground font-mono">
          {formatTime(time)}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {formatDate(time)}
        </div>
      </div>
    </div>
  );
};
