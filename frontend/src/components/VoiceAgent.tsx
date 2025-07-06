import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { apiClient, useApiAuth } from '../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '../lib/utils';
import { Mic, MicOff, Volume2, Loader2, CheckCircle, X } from 'lucide-react';

interface VoiceTask {
  title: string;
  duration: number;
  importance: 'low' | 'medium' | 'high';
  scheduledTime?: string;
  notes?: string;
}

interface ReviewTask extends VoiceTask {
  id: string;
  isApproved: boolean;
  isProcessing?: boolean;
}

export const VoiceAgent = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<VoiceTask[]>([]);
  const [reviewTasks, setReviewTasks] = useState<ReviewTask[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { isReady: apiReady } = useApiAuth();
  const queryClient = useQueryClient();

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  // Create individual task mutation
  const createSingleTaskMutation = useMutation({
    mutationFn: async (task: ReviewTask) => {
      return apiClient.createTask({
        title: task.title,
        duration: task.duration,
        importance: task.importance,
        status: 'todo',
        scheduledTime: task.scheduledTime
      });
    },
    onSuccess: (_, task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully!');
      // Remove the task from the review queue after successful creation
      removeReviewTask(task.id);
    },
    onError: (error: any) => {
      toast.error('Failed to create task: ' + error.message);
    },
  });

  // Create tasks mutation (for batch creation from review list)
  const createTasksMutation = useMutation({
    mutationFn: async (tasks: ReviewTask[]) => {
      const approvedTasks = tasks.filter(task => task.isApproved);
      const promises = approvedTasks.map(task => 
        apiClient.createTask({
          title: task.title,
          duration: task.duration,
          importance: task.importance,
          status: 'todo',
          scheduledTime: task.scheduledTime
        })
      );
      await Promise.all(promises);
      return approvedTasks;
    },
    onSuccess: (createdTasks) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(`Successfully created ${createdTasks.length} approved tasks.`);
      setReviewTasks([]);
    },
    onError: (error: any) => {
      toast.error('Failed to create tasks: ' + error.message);
    },
  });

  // Initialize speech recognition
  const initSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Speech recognition started');
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast.error('There was an error with speech recognition. Please try again.');
      stopListening();
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      if (isListening) {
        setIsListening(false);
        processTranscript();
      }
    };

    return recognition;
  };

  // Start listening
  const startListening = () => {
    if (!isSupported) {
      toast.error('Speech recognition is not supported in your browser.');
      return;
    }

    if (!apiReady) {
      toast.error('Please wait for the app to finish loading.');
      return;
    }

    const recognition = initSpeechRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    setIsListening(true);
    setTranscript('');
    setExtractedTasks([]);
    setTimeLeft(60); // 1 minute timer

    recognition.start();

    // Start 60-second timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopListening();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    toast.success('Voice Agent Activated! Speak ONE task at a time, then click Stop Recording.');
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsListening(false);
    setTimeLeft(0);

    if (transcript.trim()) {
      processTranscript();
    }
  };

  // Process transcript and extract tasks
  const processTranscript = async () => {
    if (!transcript.trim()) return;

    setIsProcessing(true);
    try {
      const response = await apiClient.extractTasksFromVoice(transcript.trim());
      
      console.log('Voice extraction response:', response);
      
      if (response.tasks && response.tasks.length > 0) {
        // Add extracted tasks to review list
        const newReviewTasks: ReviewTask[] = response.tasks.map((task, index) => ({
          ...task,
          id: `task-${Date.now()}-${index}`,
          isApproved: false,
          isProcessing: false
        }));
        
        setReviewTasks(prev => [...prev, ...newReviewTasks]);
        setExtractedTasks([]);
        setTranscript('');
        
        // Show which model was used in the success message
        const modelInfo = response.debug?.modelUsed ? ` (using ${response.debug.modelUsed})` : '';
        toast.success(`Found ${response.tasks.length} tasks in your voice input${modelInfo}. Review them below.`);
      } else {
        // Show more helpful error message
        console.log('Task extraction debug:', response.debug);
        const modelInfo = response.debug?.modelUsed ? ` Model used: ${response.debug.modelUsed}.` : '';
        
        toast.error(
          `I couldn't extract tasks from: "${transcript}". ${modelInfo} Try phrases like "Call John at 2 PM" or "Complete project presentation for 1 hour"`
        );
      }
    } catch (error: any) {
      console.error('Error processing transcript:', error);
      toast.error('Failed to process your voice input: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Add single task immediately
  const handleAddSingleTask = (task: ReviewTask) => {
    // Visually indicate the task is being processed
    setReviewTasks(tasks => 
      tasks.map(t => 
        t.id === task.id 
          ? { ...t, isApproved: true, isProcessing: true } 
          : t
      )
    );
    
    createSingleTaskMutation.mutate(task);
  };

  // Create all approved tasks from review list
  const handleCreateApprovedTasks = () => {
    const approvedTasks = reviewTasks.filter(task => task.isApproved);
    if (approvedTasks.length > 0) {
      createTasksMutation.mutate(reviewTasks);
    } else {
      toast.error('Please approve at least one task before creating.');
    }
  };

  // Toggle task approval
  const toggleTaskApproval = (taskId: string) => {
    setReviewTasks(tasks => 
      tasks.map(task => 
        task.id === taskId 
          ? { ...task, isApproved: !task.isApproved }
          : task
      )
    );
  };

  // Remove a task from the review list
  const removeReviewTask = (taskId: string) => {
    setReviewTasks(tasks => tasks.filter(task => task.id !== taskId));
  };

  // Edit a task in the review list
  const editReviewTask = (taskId: string, field: keyof VoiceTask, value: any) => {
    setReviewTasks(tasks => 
      tasks.map(task => 
        task.id === taskId 
          ? { ...task, [field]: value }
          : task
      )
    );
  };

  if (!isSupported) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MicOff className="h-5 w-5" />
            Voice Agent Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Speech recognition is not supported in your browser. Please use Chrome, Safari, or Edge for voice features.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Voice Control Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Voice Task Agent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <Button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              size="lg"
              className={cn(
                "w-full h-16 text-lg",
                isListening ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary/90"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                  Processing...
                </>
              ) : isListening ? (
                <>
                  <MicOff className="h-6 w-6 mr-2" />
                  Stop Recording ({timeLeft}s)
                </>
              ) : (
                <>
                  <Mic className="h-6 w-6 mr-2" />
                  Start Voice Input
                </>
              )}
            </Button>

            {isListening && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Listening... ({timeLeft}s remaining)</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Speak naturally about your tasks, deadlines, and priorities
                </p>
              </div>
            )}
          </div>

          {transcript && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Transcript:</h4>
              <div className="bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
                <p className="text-sm">{transcript}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Review Queue */}
      {reviewTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Task Review Queue ({reviewTasks.length})</span>
              <div className="flex gap-2">
                <span className="text-sm text-muted-foreground">
                  {reviewTasks.filter(t => t.isApproved).length} approved
                </span>
                <Button 
                  onClick={handleCreateApprovedTasks}
                  disabled={createTasksMutation.isPending || reviewTasks.filter(t => t.isApproved).length === 0}
                  size="sm"
                >
                  {createTasksMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Create Approved ({reviewTasks.filter(t => t.isApproved).length})
                    </>
                  )}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reviewTasks.map((task) => (
                <div key={task.id} className={cn(
                  "border rounded-lg p-3 space-y-2 transition-all",
                  task.isProcessing 
                    ? "border-green-500 bg-green-50/70 dark:bg-green-950/70 dark:border-green-700 opacity-80" 
                    : task.isApproved 
                      ? "border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-700" 
                      : "border-gray-200 dark:border-gray-700"
                )}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={task.isApproved}
                        onChange={() => toggleTaskApproval(task.id)}
                        className={cn(
                          "mt-1 h-4 w-4 rounded focus:ring-2 focus:ring-offset-2",
                          task.isApproved 
                            ? "text-primary border-primary bg-primary focus:ring-primary" 
                            : "text-gray-400 border-gray-300 focus:ring-gray-400"
                        )}
                      />
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => editReviewTask(task.id, 'title', e.target.value)}
                          className={cn(
                            "font-medium text-sm bg-transparent border-none p-0 w-full focus:outline-none focus:ring-1 focus:ring-primary rounded",
                            task.isApproved ? "text-green-800 dark:text-green-300 font-semibold" : "text-foreground"
                          )}
                        />
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant={task.isApproved ? "outline" : "outline"} className={task.isApproved ? "border-green-500 text-green-800 dark:text-green-300 bg-green-50 dark:bg-green-900/50" : ""}>
                            {task.duration}min
                          </Badge>
                          <Badge 
                            variant={task.importance === 'high' ? 'destructive' : task.importance === 'medium' ? 'default' : 'secondary'}
                            className={task.isApproved ? "opacity-90" : ""}
                          >
                            {task.importance}
                          </Badge>
                          {task.scheduledTime && (
                            <Badge 
                              variant="outline" 
                              className={task.isApproved ? "border-green-500 text-green-800 dark:text-green-300 bg-green-50 dark:bg-green-900/50" : ""}
                            >
                              {task.scheduledTime}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddSingleTask(task)}
                        disabled={createSingleTaskMutation.isPending || task.isProcessing}
                        className={cn(
                          "transition-all",
                          task.isProcessing 
                            ? "text-green-600 bg-green-50 dark:bg-green-900/30" 
                            : "text-green-600 hover:text-green-700"
                        )}
                      >
                        {task.isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeReviewTask(task.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <h4 className="font-semibold text-foreground">How to use Voice Agent:</h4>
            <ul className="list-disc pl-4 space-y-1">
              <li>Click "Start Voice Input" and speak naturally about your tasks</li>
              <li>Mention task names, durations, importance levels, and times</li>
              <li>Example: "I need to write a report for 2 hours, it's high priority. Also schedule a 30-minute team meeting at 2 PM."</li>
              <li><strong>New workflow:</strong> Tasks are added to a review queue where you can:</li>
              <li className="ml-4">• Check/uncheck tasks you want to approve</li>
              <li className="ml-4">• Edit task details before final creation</li>
              <li className="ml-4">• Add individual tasks immediately with the green ✓ button</li>
              <li className="ml-4">• Batch create all approved tasks at once</li>
              <li>The agent will automatically stop after 60 seconds</li>
              <li>Speak one task at a time, then click "Stop Recording" to process it</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
