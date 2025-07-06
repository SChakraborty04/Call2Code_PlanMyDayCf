import React from 'react';
import { CarGame } from './CarGame';

interface LoadingGameProps {
  isLoading: boolean;
  onComplete?: () => void;
  loadingText?: string;
}

export const LoadingGame: React.FC<LoadingGameProps> = ({ 
  isLoading, 
  onComplete, 
  loadingText = "Please wait while we process your request..." 
}) => {
  const handleGameEnd = (score: number) => {
    console.log('Game ended with score:', score);
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute top-0 left-0 w-full p-4 bg-background/80 backdrop-blur-sm z-10 text-center rounded-t-lg">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <span className="text-primary font-medium">{loadingText}</span>
          </div>
        </div>
      )}
      
      <div className="rounded-lg overflow-hidden border border-border min-h-[400px] max-h-[600px]">
        <CarGame isLoading={isLoading} onGameEnd={handleGameEnd} />
      </div>
    </div>
  );
};
