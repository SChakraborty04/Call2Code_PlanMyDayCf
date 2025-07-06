import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Trophy, Gamepad } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';

export const GameHighScoreCard = () => {
  const gameContext = useContext(GameContext);
  
  if (!gameContext) {
    throw new Error('GameHighScoreCard must be used within a GameProvider');
  }
  
  const { openGame } = gameContext;
  
  // Fetch the user's high score
  const { data, isLoading } = useQuery({
    queryKey: ['user-high-score'],
    queryFn: apiClient.getUserHighScore,
    staleTime: 1000 * 60, // 1 minute - refresh more frequently
    refetchInterval: 1000 * 60 * 2, // Auto-refetch every 2 minutes
  });

  const highScore = data?.highScore || 0;
  const allTimeHigh = data?.allTimeHigh || 0;

  const handlePlayGame = () => {
    // Open the game modal
    openGame(false, 'Get Ready!', (newScore) => {
      console.log('Game completed with score:', newScore);
      // The score will be automatically saved by the game component
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <Trophy className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="flex-grow">
            <p className="text-sm text-muted-foreground">Game High Score</p>
            <p className="text-2xl font-bold">
              {isLoading ? "..." : highScore}
            </p>
            <p className="text-xs text-muted-foreground">
              All-time high: {isLoading ? "..." : allTimeHigh}
            </p>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1" 
            onClick={handlePlayGame}
          >
            <Gamepad className="h-4 w-4" />
            Play
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
