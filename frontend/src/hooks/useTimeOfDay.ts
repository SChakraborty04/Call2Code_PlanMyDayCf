import { useState, useEffect } from 'react';

export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

export interface TimeInfo {
  timeOfDay: TimeOfDay;
  greeting: string;
  description: string;
  hour: number;
}

export const useTimeOfDay = () => {
  const [timeInfo, setTimeInfo] = useState<TimeInfo>(() => {
    const hour = new Date().getHours();
    return getTimeInfo(hour);
  });

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      setTimeInfo(getTimeInfo(hour));
    };

    // Update every minute
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return { timeInfo };
};

const getTimeInfo = (hour: number): TimeInfo => {
  if (hour >= 5 && hour < 12) {
    return {
      timeOfDay: 'morning',
      greeting: 'Good morning!',
      description: 'Start your day with intelligent planning',
      hour
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      timeOfDay: 'day',
      greeting: 'Good afternoon!',
      description: 'Keep your momentum with smart scheduling',
      hour
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      timeOfDay: 'evening',
      greeting: 'Good evening!',
      description: 'Wind down while planning tomorrow',
      hour
    };
  } else {
    return {
      timeOfDay: 'night',
      greeting: 'Good night!',
      description: 'Set yourself up for tomorrow\'s success',
      hour
    };
  }
};