
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { apiClient, useApiAuth } from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Brain, Sparkles, Calendar, Clock, Zap, RefreshCw, Settings, Plus, Trash2 } from 'lucide-react';
import { useGame } from '../contexts/GameContext';

export const AIGenerator = () => {
  const { isReady: apiReady } = useApiAuth(); // Initialize API client with Clerk auth
  const { openGame, setGameLoading } = useGame();
  
  const [customPrompts, setCustomPrompts] = useState<string[]>(['']);
  const [showCustomPrompts, setShowCustomPrompts] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: planData, isLoading: planLoading } = useQuery({
    queryKey: ['plan'],
    queryFn: apiClient.getPlan,
  });

  const generatePlanMutation = useMutation({
    mutationFn: () => {
      const validPrompts = customPrompts.filter(p => p.trim().length > 0);
      // Open the game when starting mutation
      // The game will remain open until the user explicitly closes it
      openGame(true, "Generating your AI schedule... Enjoy this game while you wait!");
      return apiClient.generatePlan(validPrompts.length > 0 ? { customPrompts: validPrompts } : undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan'] });
      toast.success('AI plan generated successfully!');
      // Update game state to show it's no longer loading, but DON'T close it
      setGameLoading(false);
    },
    onError: (error: any) => {
      toast.error('Failed to generate plan: ' + error.message);
      // Update game state to show it's no longer loading, but DON'T close it
      setGameLoading(false);
    },
  });

  const handleGeneratePlan = () => {
    generatePlanMutation.mutate();
  };

  const addCustomPrompt = () => {
    setCustomPrompts(prev => [...prev, '']);
  };

  const updateCustomPrompt = (index: number, value: string) => {
    setCustomPrompts(prev => prev.map((prompt, i) => i === index ? value : prompt));
  };

  const removeCustomPrompt = (index: number) => {
    setCustomPrompts(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Schedule Generator
          </CardTitle>
          <CardDescription>
            Let our AI create an optimized daily schedule based on your tasks and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium">Smart Planning</h3>
                  <p className="text-sm text-muted-foreground">
                    AI analyzes your tasks, energy levels, and preferences
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Prompts Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  <Label className="font-medium">Custom Instructions</Label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomPrompts(!showCustomPrompts)}
                >
                  {showCustomPrompts ? 'Hide' : 'Add Custom Instructions'}
                </Button>
              </div>

              {showCustomPrompts && (
                <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/20">
                  <p className="text-sm text-muted-foreground">
                    Add custom instructions for the AI (e.g., "Schedule workout before 10 AM", "Do creative tasks in the morning")
                  </p>
                  
                  {customPrompts.map((prompt, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        placeholder={`Custom instruction ${index + 1}...`}
                        value={prompt}
                        onChange={(e) => updateCustomPrompt(index, e.target.value)}
                        className="flex-1 min-h-[60px]"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomPrompt(index)}
                        className="mt-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomPrompt}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Instruction
                  </Button>
                </div>
              )}
            </div>

            <Button 
              onClick={handleGeneratePlan}
              disabled={generatePlanMutation.isPending}
              className="w-full"
              variant="ai"
            >
              {generatePlanMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate AI Schedule
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Game modal is handled by the game context */}

      {planData?.plan && !generatePlanMutation.isPending && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Your AI-Generated Schedule
            </CardTitle>
            <CardDescription>
              Optimized schedule based on your tasks and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {planData.plan.schedule?.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{item.activity}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{item.time}</span>
                      </div>
                      {item.duration && (
                        <div className="flex items-center gap-1">
                          <span>{item.duration} min</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      item.type === 'task'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : item.type === 'break'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    }
                  >
                    {item.type}
                  </Badge>
                </div>
              ))}
              
              {planData.plan.summary && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Summary</h4>
                  <p className="text-sm text-muted-foreground">{planData.plan.summary}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {planLoading && !generatePlanMutation.isPending && (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      )}

      {!planData?.plan && !planLoading && !generatePlanMutation.isPending && (
        <Card>
          <CardContent className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No AI schedule yet</h3>
            <p className="text-muted-foreground">
              Generate your first AI-powered schedule to get started!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
