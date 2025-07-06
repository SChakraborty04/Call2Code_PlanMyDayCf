import React from 'react';
import { GameModal } from './GameModal';
import { useGame } from '../contexts/GameContext';

export const GameModalContainer: React.FC = () => {
  const { isGameOpen, closeGame, isGameLoading, gameLoadingText, onGameComplete } = useGame();
  
  const handleGameEnd = (score: number) => {
    if (onGameComplete) {
      onGameComplete(score);
    }
  };
  
  const handleClose = () => {
    // Ensure we call the closeGame from context
    console.log("GameModalContainer: handleClose called");
    // Force sync state update
    setTimeout(() => {
      closeGame();
    }, 0);
  };
  
  return (
    <GameModal 
      isOpen={isGameOpen}
      onClose={handleClose}
      isLoading={isGameLoading}
      loadingText={gameLoadingText}
      onGameEnd={handleGameEnd}
    />
  );
};
