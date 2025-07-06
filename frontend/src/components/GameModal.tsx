import React, { useState, useEffect } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { GameDialogContent } from './GameDialogContent';
import { Button } from './ui/button';
import { CarGame } from './CarGame';
import { apiClient } from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  loadingText?: string;
  onGameEnd?: (score: number) => void;
}

export const GameModal: React.FC<GameModalProps> = ({
  isOpen,
  onClose,
  isLoading = false,
  loadingText = 'Loading...',
  onGameEnd
}) => {
  const [gameScore, setGameScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [allTimeHigh, setAllTimeHigh] = useState<number>(0);
  const [readyToClose, setReadyToClose] = useState(false);
  const queryClient = useQueryClient();
  
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setReadyToClose(false);
      setGameScore(0);
      
      // Load high score when the modal opens
      const loadHighScore = async () => {
        try {
          console.log('GameModal: Loading fresh high score data');
          const response = await apiClient.getUserHighScore();
          if (response && response.highScore) {
            setHighScore(response.highScore);
            setAllTimeHigh(response.allTimeHigh || 0);
          } else {
            // If no high score from API, check localStorage as fallback
            const savedHighScore = localStorage.getItem('carGameHighScore');
            if (savedHighScore) {
              setHighScore(parseInt(savedHighScore));
            }
          }
        } catch (error) {
          console.error('Error loading high score:', error);
          // Use localStorage as fallback
          const savedHighScore = localStorage.getItem('carGameHighScore');
          if (savedHighScore) {
            setHighScore(parseInt(savedHighScore));
          }
        }
      };
      
      loadHighScore();
    }
  }, [isOpen]);
  
  // When loading finishes, we'll show the close button, but we won't automatically
  // set ready to close - the user must explicitly choose to close
  useEffect(() => {
    if (!isLoading && isOpen && gameScore > 0) {
      // We're not automatically setting readyToClose anymore
      // The user must explicitly click the Close Game button
    }
  }, [isLoading, isOpen, gameScore]);
  
  const handleGameEnd = (score: number) => {
    setGameScore(score);
    
    // Update high score if current score is higher
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('carGameHighScore', score.toString());
    }
    
    if (onGameEnd) {
      onGameEnd(score);
    }
  };
  
  // Save the score to the backend
  const saveScore = () => {
    if (gameScore > 0) {
      // Save score to backend
      apiClient.saveGameHighScore(gameScore)
        .then(() => {
          // Invalidate the high score cache to ensure all components show updated scores
          queryClient.invalidateQueries({ queryKey: ['user-high-score'] });
          console.log('Invalidated high score cache after saving new score');
        })
        .catch(error => {
          console.error('Error saving score:', error);
        });
    }
  };
  
  const handleClose = () => {
    // Save high score when closing
    console.log("GameModal: handleClose called");
    saveScore();
    
    // Call the onClose callback from props
    onClose();
  };

  const handleShowResult = () => {
    // Save score and close the modal
    console.log("GameModal: handleShowResult called");
    saveScore();
    // Force close
    setTimeout(() => {
      onClose();
    }, 0);
  };
  
  const handleContinuePlaying = () => {
    setReadyToClose(false);
  };
  
  // Disable the Dialog's default close behavior with ESC key or clicking outside
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // Only respond to explicit close actions via our buttons
        if (!open) {
          console.log("Dialog onOpenChange: closing");
          saveScore();
          onClose();
        }
      }}
    >
      <GameDialogContent 
        className="max-w-2xl w-[90vw] max-h-[80vh] overflow-hidden"
        onCloseClick={handleClose}
      >
        <DialogHeader className="relative">
          <DialogTitle>Car Racing Game</DialogTitle>
          <DialogDescription>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>{loadingText}</span>
              </div>
            ) : (
              <div className="space-y-1">
                {gameScore > 0 ? (
                  <>
                    <span className="block">Your score: {gameScore}</span>
                    <span className="block text-xs text-muted-foreground">Your high score: {highScore}</span>
                    <span className="block text-xs text-muted-foreground">All-time high: {allTimeHigh}</span>
                  </>
                ) : (
                  <>
                    <span className="block">Use arrow keys to control the car. Don't crash!</span>
                    {highScore > 0 && <span className="block text-xs text-muted-foreground">Your high score: {highScore}</span>}
                    <span className="block text-xs text-muted-foreground">All-time high: {allTimeHigh}</span>
                  </>
                )}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="h-[500px] rounded-md overflow-hidden border border-border">
          <CarGame 
            isLoading={isLoading} 
            onGameEnd={handleGameEnd}
            onContinuePlaying={handleContinuePlaying}
          />
        </div>
        
        {/* Always show the buttons (except during loading) to allow closing */}
        {!isLoading && (
          <div className="flex justify-end gap-3 mt-4">
            <Button 
              variant="outline" 
              onClick={handleContinuePlaying}
            >
              Continue Playing
            </Button>
            {gameScore > 0 && (
              <Button 
                onClick={handleShowResult}
                variant="secondary"
              >
                Show Result
              </Button>
            )}
            <Button 
              onClick={handleClose}
              variant="default"
            >
              Close Game
            </Button>
          </div>
        )}
      </GameDialogContent>
    </Dialog>
  );
};
