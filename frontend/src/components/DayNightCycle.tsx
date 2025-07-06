import React, { useEffect, useState, useRef } from 'react';
import { useTimeOfDay } from "../hooks/useTimeOfDay";

const DayNightCycle = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);
  const moonRef = useRef<HTMLDivElement>(null);
  const { timeInfo } = useTimeOfDay();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update dimensions when window resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Update the scene based on current time
  useEffect(() => {
    const updateScene = () => {
      if (!skyRef.current || !sunRef.current || !moonRef.current) return;
      
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      const sunrise = 6 * 3600; // 6:00 AM
      const sunset = 18 * 3600; // 6:00 PM
      
      const isDay = totalSeconds >= sunrise && totalSeconds < sunset;
      
      if (isDay) {
        setDayMode(totalSeconds, sunrise, sunset);
      } else {
        setNightMode(totalSeconds, sunrise, sunset);
      }
    };
    
    const setDayMode = (totalSeconds: number, sunrise: number, sunset: number) => {
      if (!skyRef.current || !sunRef.current || !moonRef.current || !containerRef.current) return;
      
      // Set day environment
      skyRef.current.classList.remove('night');
      
      // Show only sun, hide moon
      sunRef.current.classList.add('visible');
      moonRef.current.classList.remove('visible');
      
      // Calculate sun position in semicircle
      const dayDuration = sunset - sunrise;
      const dayProgress = (totalSeconds - sunrise) / dayDuration;
      
      // Semicircular path: angle from 0 to π (180 degrees)
      const angle = dayProgress * Math.PI;
      
      // Calculate position on semicircle
      const centerX = dimensions.width / 2;
      const baseY = dimensions.height * 0.65; // Moved even higher up for better visibility
      const radiusX = dimensions.width * 0.4; // Horizontal radius
      const radiusY = dimensions.height * 0.5; // Vertical radius
      
      // Parametric equations for elliptical semicircle
      const sunX = centerX + Math.cos(Math.PI - angle) * radiusX - 45; // -45 for centering (90px/2)
      const sunY = baseY - Math.sin(angle) * radiusY - 45;
      
      sunRef.current.style.left = `${sunX}px`;
      sunRef.current.style.top = `${sunY}px`;
    };
    
    const setNightMode = (totalSeconds: number, sunrise: number, sunset: number) => {
      if (!skyRef.current || !sunRef.current || !moonRef.current || !containerRef.current) return;
      
      // Set night environment
      skyRef.current.classList.add('night');
      
      // Show only moon, hide sun
      moonRef.current.classList.add('visible');
      sunRef.current.classList.remove('visible');
      
      // Calculate night progress
      let nightProgress;
      const dayLength = 24 * 3600;
      const nightDuration = dayLength - (sunset - sunrise);
      
      if (totalSeconds < sunrise) {
        // Early morning (midnight to sunrise)
        nightProgress = (totalSeconds + (dayLength - sunset)) / nightDuration;
      } else {
        // Evening (sunset to midnight)
        nightProgress = (totalSeconds - sunset) / nightDuration;
      }
      
      // Semicircular path for moon
      const angle = nightProgress * Math.PI;
      
      const centerX = dimensions.width / 2;
      const baseY = dimensions.height * 0.65; // Moved even higher up for better visibility
      const radiusX = dimensions.width * 0.4; // Horizontal radius
      const radiusY = dimensions.height * 0.5; // Vertical radius
      
      const moonX = centerX + Math.cos(Math.PI - angle) * radiusX - 45; // -45 for centering (90px/2)
      const moonY = baseY - Math.sin(angle) * radiusY - 45;
      
      moonRef.current.style.left = `${moonX}px`;
      moonRef.current.style.top = `${moonY}px`;
    };
    
    updateScene();
    const interval = setInterval(updateScene, 1000);
    
    return () => clearInterval(interval);
  }, [dimensions]);
  
  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full overflow-hidden z-0 opacity-50 pointer-events-none mb-24"
    >
      <div 
        ref={skyRef} 
        className="sky w-full h-full absolute transition-all duration-1000"
      >
        <div 
          ref={sunRef} 
          className="celestial-body sun"
        ></div>
        <div 
          ref={moonRef} 
          className="celestial-body moon"
        ></div>
      </div>
    </div>
  );
};

export default DayNightCycle;
