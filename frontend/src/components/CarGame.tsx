import React, { useEffect, useRef, useState } from 'react';
import { apiClient } from '../lib/api';
import './CarGame.css';

interface CarGameProps {
  onGameEnd?: (score: number) => void;
  onContinuePlaying?: () => void;
  isLoading: boolean;
}

export const CarGame: React.FC<CarGameProps> = ({ onGameEnd, onContinuePlaying, isLoading }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showEndGamePrompt, setShowEndGamePrompt] = useState(false);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const playerRef = useRef({
    x: 0,
    y: 0,
    speed: 5,
    score: 0,
    start: false
  });
  
  const keysRef = useRef({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  });
  
  useEffect(() => {
    // Load high score from localStorage initially
    const savedHighScore = localStorage.getItem('carGameHighScore') || '0';
    setHighScore(parseInt(savedHighScore));
    
    // Event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        keysRef.current[e.key as keyof typeof keysRef.current] = true;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        keysRef.current[e.key as keyof typeof keysRef.current] = false;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // When loading state changes and we have a high score
  useEffect(() => {
    if (!isLoading && isPlaying && score > 0) {
      // In modal context, we don't want to automatically show the end game prompt
      // The parent component will handle this
      if (!onContinuePlaying && !onGameEnd) {
        setShowEndGamePrompt(true);
      }
    }
  }, [isLoading, isPlaying, score, onContinuePlaying, onGameEnd]);
  
  const startGame = () => {
    if (!gameAreaRef.current) return;
    
    setIsPlaying(true);
    setShowEndGamePrompt(false);
    gameAreaRef.current.innerHTML = '';
    playerRef.current.start = true;
    playerRef.current.score = 0;
    setScore(0);
    
    // Create road lines
    for (let i = 0; i < 5; i++) {
      const roadLine = document.createElement('div');
      roadLine.setAttribute('class', 'line');
      roadLine.style.top = `${i * 150}px`;
      (roadLine as any).y = i * 150;
      gameAreaRef.current.appendChild(roadLine);
    }
    
    // Create player car
    const car = document.createElement('div');
    car.setAttribute('class', 'car');
    gameAreaRef.current.appendChild(car);
    carRef.current = car;
    
    playerRef.current.x = car.offsetLeft;
    playerRef.current.y = car.offsetTop;
    
    // Create enemy cars
    for (let i = 0; i < 3; i++) {
      const enemyCar = document.createElement('div');
      enemyCar.setAttribute('class', 'enemyCar');
      (enemyCar as any).y = (i + 1) * 350 * -1;
      enemyCar.style.top = `${(enemyCar as any).y}px`;
      enemyCar.style.left = `${Math.floor(Math.random() * 350)}px`;
      gameAreaRef.current.appendChild(enemyCar);
    }
    
    animationFrameRef.current = requestAnimationFrame(gamePlay);
  };
  
  const gamePlay = () => {
    if (!gameAreaRef.current || !carRef.current || !playerRef.current.start) return;
    
    moveLines();
    moveEnemyCar();
    
    const car = carRef.current;
    const road = gameAreaRef.current.getBoundingClientRect();
    
    if (keysRef.current.ArrowUp && playerRef.current.y > road.top + 150) {
      playerRef.current.y -= playerRef.current.speed;
    }
    if (keysRef.current.ArrowDown && playerRef.current.y < road.bottom - 80) {
      playerRef.current.y += playerRef.current.speed;
    }
    if (keysRef.current.ArrowLeft && playerRef.current.x > 0) {
      playerRef.current.x -= playerRef.current.speed;
    }
    if (keysRef.current.ArrowRight && playerRef.current.x < road.width - 70) {
      playerRef.current.x += playerRef.current.speed;
    }
    
    car.style.top = `${playerRef.current.y}px`;
    car.style.left = `${playerRef.current.x}px`;
    
    playerRef.current.score++;
    setScore(playerRef.current.score);
    
    animationFrameRef.current = requestAnimationFrame(gamePlay);
  };
  
  const moveLines = () => {
    if (!gameAreaRef.current) return;
    
    const lines = document.querySelectorAll('.line');
    lines.forEach((line) => {
      let lineY = (line as any).y;
      
      if (lineY >= 700) {
        lineY -= 750;
      }
      
      lineY += playerRef.current.speed;
      (line as any).y = lineY;
      (line as HTMLElement).style.top = `${lineY}px`;
    });
  };
  
  const isCollide = (car: HTMLDivElement, enemyCar: HTMLDivElement) => {
    const carRect = car.getBoundingClientRect();
    const enemyCarRect = enemyCar.getBoundingClientRect();
    
    return !(
      carRect.top > enemyCarRect.bottom ||
      carRect.left > enemyCarRect.right ||
      carRect.right < enemyCarRect.left ||
      carRect.bottom < enemyCarRect.top
    );
  };
  
  const moveEnemyCar = () => {
    if (!gameAreaRef.current || !carRef.current) return;
    
    const car = carRef.current;
    const enemyCars = document.querySelectorAll('.enemyCar');
    
    enemyCars.forEach((enemyCar) => {
      if (isCollide(car, enemyCar as HTMLDivElement)) {
        endGame();
        return;
      }
      
      let enemyY = (enemyCar as any).y;
      
      if (enemyY >= 750) {
        enemyY = -300;
        (enemyCar as HTMLElement).style.left = `${Math.floor(Math.random() * 350)}px`;
      }
      
      enemyY += playerRef.current.speed;
      (enemyCar as any).y = enemyY;
      (enemyCar as HTMLElement).style.top = `${enemyY}px`;
    });
  };
  
  const endGame = async () => {
    playerRef.current.start = false;
    setIsPlaying(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Update high score if needed
    if (playerRef.current.score > highScore) {
      const newHighScore = playerRef.current.score;
      setHighScore(newHighScore);
      localStorage.setItem('carGameHighScore', newHighScore.toString());
      
      // Save high score to backend
      try {
        await apiClient.saveGameHighScore(newHighScore);
        console.log('High score saved successfully');
      } catch (error) {
        console.error('Failed to save high score:', error);
      }
    }
    
    if (!isLoading && onGameEnd) {
      onGameEnd(playerRef.current.score);
    } else {
      // If still loading, show option to continue playing
      setShowEndGamePrompt(true);
    }
  };
  
  const handleContinuePlaying = () => {
    setShowEndGamePrompt(false);
    if (onContinuePlaying) {
      onContinuePlaying();
    }
    startGame();
  };
  
  const handleEndGame = () => {
    setShowEndGamePrompt(false);
    if (onGameEnd) {
      onGameEnd(playerRef.current.score);
    }
  };
  
  return (
    <div className="carGame">
      {!isPlaying && !showEndGamePrompt && (
        <div className="startScreen" onClick={startGame}>
          <p>
            Click here to start<br />
            Use arrow keys to move<br />
            If you hit another car you will lose
          </p>
        </div>
      )}
      
      {showEndGamePrompt && (
        <div className="startScreen">
          <p>
            Your request is ready!<br />
            Score: {score}<br />
            Would you like to continue playing or see your results?
          </p>
          <div className="flex justify-center space-x-4 mt-4">
            <button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
              onClick={handleContinuePlaying}
            >
              Continue Playing
            </button>
            <button 
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              onClick={handleEndGame}
            >
              Show Results
            </button>
          </div>
        </div>
      )}
      
      <div className={`score ${!isPlaying && 'hide'}`}>Score: {score}</div>
      <div className={`highScore ${!isPlaying && 'hide'}`}>High Score: {highScore}</div>
      <div className="gameArea" ref={gameAreaRef}></div>
    </div>
  );
};
