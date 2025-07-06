import React, { createContext, useState, useContext, ReactNode } from 'react';

interface GameContextProps {
  isGameOpen: boolean;
  openGame: (loadingState?: boolean, loadingText?: string, onComplete?: (score: number) => void) => void;
  closeGame: () => void;
  setGameLoading: (loading: boolean) => void;
  isGameLoading: boolean;
  gameLoadingText: string;
  onGameComplete?: (score: number) => void;
}

export const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isGameLoading, setIsGameLoading] = useState(false);
  const [gameLoadingText, setGameLoadingText] = useState('Loading...');
  const [onGameComplete, setOnGameComplete] = useState<((score: number) => void) | undefined>(undefined);
  
  const openGame = (
    loadingState = true, 
    loadingText = 'Loading...', 
    onComplete?: (score: number) => void
  ) => {
    setIsGameLoading(loadingState);
    setGameLoadingText(loadingText);
    setOnGameComplete(onComplete);
    setIsGameOpen(true);
  };
  
  const closeGame = () => {
    // Make sure we reset all state when closing the game
    console.log("GameContext: closeGame called");
    setIsGameOpen(false);
    setIsGameLoading(false);
    setGameLoadingText('Loading...');
    setOnGameComplete(undefined);
  };
  
  const setGameLoading = (loading: boolean) => {
    setIsGameLoading(loading);
  };
  
  return (
    <GameContext.Provider 
      value={{
        isGameOpen,
        openGame,
        closeGame,
        setGameLoading,
        isGameLoading,
        gameLoadingText,
        onGameComplete
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
