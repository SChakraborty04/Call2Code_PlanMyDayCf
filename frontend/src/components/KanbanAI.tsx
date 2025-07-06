"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Mic, MicOff, MessageCircle, Volume2, VolumeX, Loader2, Sparkles, Clock } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { toast } from "sonner";

interface DictationResponse {
  ok: boolean;
  dictation: string;
  taskCount: number;
  breakdown: {
    backlog: number;
    todo: number;
    doing: number;
    done: number;
  };
  context?: {
    currentTime: string;
    timeOfDay: string;
    dayOfWeek: string;
    isWeekend: boolean;
    isWorkingHours: boolean;
    weatherAvailable: boolean;
  };
  debug?: {
    modelUsed: string;
    attemptCount: number;
  };
}

interface AskResponse {
  ok: boolean;
  question: string;
  answer: string;
  context: {
    currentTime: string;
    taskCount: number;
    weatherAvailable: boolean;
    planAvailable: boolean;
  };
  debug?: {
    modelUsed: string;
    attemptCount: number;
  };
}

export const KanbanAI = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'dictate' | 'ask'>('dictate');
  const [question, setQuestion] = useState('');
  const [lastDictation, setLastDictation] = useState<DictationResponse | null>(null);
  const [lastAnswer, setLastAnswer] = useState<AskResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Time utility functions
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTimeOfDay = (date: Date) => {
    const hour = date.getHours();
    if (hour < 6) return 'late night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };

  const getTimeContext = (date: Date) => {
    const timeOfDay = getTimeOfDay(date);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
    
    return {
      time: formatTime(date),
      timeOfDay,
      dayOfWeek,
      date: formattedDate,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isWorkingHours: date.getHours() >= 9 && date.getHours() < 17,
      isBusinessDay: date.getDay() >= 1 && date.getDay() <= 5
    };
  };

  // Dictation mutation
  const dictateMutation = useMutation({
    mutationFn: async (): Promise<DictationResponse> => {
      return await apiClient.dictateKanbanTasks();
    },
    onSuccess: (data) => {
      setLastDictation(data);
      if (data.dictation) {
        speakText(data.dictation);
      }
      toast.success(`Generated dictation for ${data.taskCount} tasks`);
    },
    onError: (error: any) => {
      console.error('Dictation error:', error);
      toast.error(error.response?.data?.error || 'Failed to generate task dictation');
    },
  });

  // Ask AI mutation
  const askMutation = useMutation({
    mutationFn: async (question: string): Promise<AskResponse> => {
      return await apiClient.askKanbanAI(question);
    },
    onSuccess: (data) => {
      setLastAnswer(data);
      if (data.answer) {
        speakText(data.answer);
      }
      toast.success('AI assistant responded');
    },
    onError: (error: any) => {
      console.error('Ask AI error:', error);
      toast.error(error.response?.data?.error || 'Failed to get AI response');
    },
  });

  // Text-to-speech function
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Text-to-speech not supported in this browser');
    }
  };

  // Stop speech
  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  // Initialize speech recognition
  React.useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        toast.info('Listening... Speak your question');
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
        toast.success('Voice captured: ' + transcript);
        
        // Check for dictation commands
        const lowerTranscript = transcript.toLowerCase();
        if (lowerTranscript.includes('dictate') || 
            lowerTranscript.includes('overview') || 
            lowerTranscript.includes('tell me about my tasks') ||
            lowerTranscript.includes('read my tasks')) {
          // Switch to dictate tab and generate dictation
          setActiveTab('dictate');
          setTimeout(() => {
            dictateMutation.mutate();
          }, 500);
        } else {
          // Add time context to the question
          const timeContext = getTimeContext(currentTime);
          const contextualQuestion = `Current time: ${timeContext.time} on ${timeContext.dayOfWeek} ${timeContext.timeOfDay}. ${transcript.trim()}`;
          
          // Auto-ask the question after a short delay
          setTimeout(() => {
            if (transcript.trim()) {
              askMutation.mutate(contextualQuestion);
            }
          }, 1000);
        }
      };
      
      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please enable microphone permissions.');
        } else {
          toast.error('Speech recognition error: ' + event.error);
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      setSpeechRecognition(recognition);
    } else {
      setSpeechSupported(false);
    }
  }, []);

  // Keyboard shortcut for voice activation (Ctrl/Cmd + Shift + V)
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (showDialog && (event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'V') {
        event.preventDefault();
        if (isListening) {
          stopVoiceRecognition();
        } else {
          startVoiceRecognition();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showDialog, isListening, speechRecognition]);

  // Start voice recognition
  const startVoiceRecognition = () => {
    if (speechRecognition) {
      speechRecognition.start();
    } else {
      toast.error('Speech recognition not supported in this browser');
    }
  };

  // Stop voice recognition
  const stopVoiceRecognition = () => {
    if (speechRecognition) {
      speechRecognition.stop();
      setIsListening(false);
    }
  };

  const handleAskQuestion = () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }
    
    // Add time context to all questions
    const timeContext = getTimeContext(currentTime);
    const contextualQuestion = `Current time: ${timeContext.time} on ${timeContext.dayOfWeek} ${timeContext.timeOfDay}. ${question.trim()}`;
    
    askMutation.mutate(contextualQuestion);
  };

  const handleDictate = () => {
    dictateMutation.mutate();
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-300/50 hover:border-purple-400/70 text-purple-700 dark:text-purple-300"
        >
          <Sparkles className="h-4 w-4" />
          KanbanAI
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              KanbanAI Assistant
            </DialogTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-mono">
                {formatTime(currentTime)}
              </span>
              <Badge variant="outline" className="text-xs">
                {getTimeOfDay(currentTime)}
              </Badge>
            </div>
          </div>
          <DialogDescription>
            Get AI-powered insights about your tasks and ask questions about your productivity.
            <br />
            <span className="text-xs text-muted-foreground mt-1 block">
              💡 Press Ctrl+Shift+V (Cmd+Shift+V on Mac) to activate voice input anytime
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <Button
            variant={activeTab === 'dictate' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('dictate')}
            className="rounded-b-none"
          >
            <Volume2 className="h-4 w-4 mr-2" />
            Dictate Tasks
          </Button>
          <Button
            variant={activeTab === 'ask' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('ask')}
            className="rounded-b-none"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Ask AI
          </Button>
        </div>

        <div className="space-y-6">
          {/* Dictate Tab */}
          {activeTab === 'dictate' && (
            <div className="space-y-4">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      Get an AI-generated overview of your Kanban board with motivational insights.
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatTime(currentTime)} • {getTimeContext(currentTime).dayOfWeek} {getTimeOfDay(currentTime)}
                        {getTimeContext(currentTime).isWeekend && ' (Weekend)'}
                        {!getTimeContext(currentTime).isWorkingHours && getTimeContext(currentTime).isBusinessDay && ' (After Hours)'}
                      </span>
                    </div>
                  </div>
                  {isListening && (
                    <div className="flex items-center gap-2 text-red-600 animate-pulse">
                      <div className="h-2 w-2 bg-red-600 rounded-full animate-ping"></div>
                      <span className="text-sm font-medium">Listening...</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={handleDictate}
                    disabled={dictateMutation.isPending}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {dictateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Generate Dictation
                      </>
                    )}
                  </Button>
                  
                  {speechSupported && (
                    <Button
                      onClick={isListening ? stopVoiceRecognition : () => {
                        setActiveTab('ask');
                        setTimeout(startVoiceRecognition, 100);
                      }}
                      variant={isListening ? "destructive" : "outline"}
                      size="lg"
                      disabled={dictateMutation.isPending}
                      className={isListening ? 'animate-pulse' : ''}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="h-4 w-4 mr-2" />
                          Stop Listening
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          Voice Command
                        </>
                      )}
                    </Button>
                  )}
                  
                  {isPlaying && (
                    <Button
                      onClick={stopSpeech}
                      variant="outline"
                      size="lg"
                    >
                      <VolumeX className="h-4 w-4 mr-2" />
                      Stop Speech
                    </Button>
                  )}
                </div>
              </div>

              {/* Dictation Results */}
              {lastDictation && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Task Overview</h4>
                    <div className="flex gap-2">
                      {lastDictation.debug && (
                        <Badge variant="secondary" className="text-xs">
                          {lastDictation.debug.modelUsed}
                        </Badge>
                      )}
                      {lastDictation.context && (
                        <Badge variant="outline" className="text-xs">
                          {lastDictation.context.currentTime} • {lastDictation.context.timeOfDay}
                          {lastDictation.context.isWeekend && ' • Weekend'}
                          {!lastDictation.context.isWorkingHours && !lastDictation.context.isWeekend && ' • After Hours'}
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {lastDictation.taskCount} tasks
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="prose dark:prose-invert text-sm">
                    <p className="text-foreground leading-relaxed">
                      {lastDictation.dictation}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    <div className="text-center p-2 bg-background rounded">
                      <div className="text-lg font-bold text-gray-600">{lastDictation.breakdown.backlog}</div>
                      <div className="text-xs text-muted-foreground">Backlog</div>
                    </div>
                    <div className="text-center p-2 bg-background rounded">
                      <div className="text-lg font-bold text-blue-600">{lastDictation.breakdown.todo}</div>
                      <div className="text-xs text-muted-foreground">To Do</div>
                    </div>
                    <div className="text-center p-2 bg-background rounded">
                      <div className="text-lg font-bold text-yellow-600">{lastDictation.breakdown.doing}</div>
                      <div className="text-xs text-muted-foreground">In Progress</div>
                    </div>
                    <div className="text-center p-2 bg-background rounded">
                      <div className="text-lg font-bold text-green-600">{lastDictation.breakdown.done}</div>
                      <div className="text-xs text-muted-foreground">Done</div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => speakText(lastDictation.dictation)}
                    variant="outline"
                    size="sm"
                    disabled={isPlaying}
                    className="w-full"
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    {isPlaying ? 'Playing...' : 'Replay Audio'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Ask Tab */}
          {activeTab === 'ask' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">
                    Ask the AI assistant about your tasks, schedule, productivity tips, or anything related to your workflow.
                  </p>
                  {isListening && (
                    <div className="flex items-center gap-2 text-red-600 animate-pulse">
                      <div className="h-2 w-2 bg-red-600 rounded-full animate-ping"></div>
                      <span className="text-sm font-medium">Listening...</span>
                    </div>
                  )}
                </div>
                
                <Textarea
                  placeholder="What would you like to know? (e.g., 'What should I work on next?', 'How can I be more productive today?', 'When is the best time for my important tasks?')"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                
                {/* Voice Input Button */}
                {speechSupported && (
                  <div className="flex justify-center">
                    <Button
                      onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                      variant={isListening ? "destructive" : "outline"}
                      size="sm"
                      className={`flex items-center gap-2 ${isListening ? 'animate-pulse' : ''}`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="h-4 w-4" />
                          Stop Listening
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" />
                          Ask by Voice
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
                {!speechSupported && (
                  <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Voice input not supported in this browser. Try Chrome, Safari, or Edge.
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleAskQuestion}
                    disabled={askMutation.isPending || !question.trim()}
                    className="flex-1"
                  >
                    {askMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Thinking...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Ask AI
                      </>
                    )}
                  </Button>
                  
                  {isPlaying && (
                    <Button
                      onClick={stopSpeech}
                      variant="outline"
                    >
                      <VolumeX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* AI Response */}
              {lastAnswer && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">AI Response</h4>
                    <div className="flex gap-2">
                      {lastAnswer.debug && (
                        <Badge variant="secondary" className="text-xs">
                          {lastAnswer.debug.modelUsed}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {lastAnswer.context.taskCount} tasks • {lastAnswer.context.currentTime}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Q: {lastAnswer.question}
                    </div>
                    <div className="prose dark:prose-invert text-sm">
                      <p className="text-foreground leading-relaxed">
                        {lastAnswer.answer}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => speakText(lastAnswer.answer)}
                      variant="outline"
                      size="sm"
                      disabled={isPlaying}
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      {isPlaying ? 'Playing...' : 'Play Audio'}
                    </Button>
                    
                    <Button
                      onClick={() => setQuestion('')}
                      variant="outline"
                      size="sm"
                    >
                      Ask Another
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Quick Questions */}
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Quick Questions (Click or Say):</h5>
                <div className="grid grid-cols-1 gap-2">
                  {(() => {
                    const timeContext = getTimeContext(currentTime);
                    const baseQuestions = [
                      "What should I work on next?",
                      "How can I be more productive today?",
                      "When is the best time for my important tasks?",
                      "What's my progress today?",
                      "Any suggestions based on the weather?",
                      "Dictate my tasks",
                      "Give me an overview"
                    ];
                    
                    // Add time-specific questions
                    const timeSpecificQuestions = [];
                    if (timeContext.timeOfDay === 'morning') {
                      timeSpecificQuestions.push("What should I prioritize this morning?");
                      timeSpecificQuestions.push("Help me plan my day");
                    } else if (timeContext.timeOfDay === 'afternoon') {
                      timeSpecificQuestions.push("How am I doing so far today?");
                      timeSpecificQuestions.push("What should I focus on this afternoon?");
                    } else if (timeContext.timeOfDay === 'evening') {
                      timeSpecificQuestions.push("How was my productivity today?");
                      timeSpecificQuestions.push("What should I prepare for tomorrow?");
                    } else {
                      timeSpecificQuestions.push("Any late-night tasks I can work on?");
                    }
                    
                    if (timeContext.isWeekend) {
                      timeSpecificQuestions.push("Weekend planning suggestions?");
                    }
                    
                    if (!timeContext.isWorkingHours && timeContext.isBusinessDay) {
                      timeSpecificQuestions.push("Personal tasks for after work?");
                    }
                    
                    return [...timeSpecificQuestions, ...baseQuestions];
                  })().map((quickQ) => (
                    <Button
                      key={quickQ}
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuestion(quickQ)}
                      className="justify-start text-left h-auto py-2 px-3 text-muted-foreground hover:text-foreground"
                    >
                      {quickQ}
                    </Button>
                  ))}
                </div>
                
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <h6 className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-2">
                    💡 Voice Commands & Time-Aware Tips:
                  </h6>
                  <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• Say "dictate my tasks" or "give me an overview" for task summary</li>
                    <li>• Ask any question naturally like "What should I work on next?"</li>
                    <li>• The AI automatically knows it's {getTimeOfDay(currentTime)} on {getTimeContext(currentTime).dayOfWeek}</li>
                    <li>• Time-aware suggestions change based on your current context</li>
                    {getTimeContext(currentTime).isWeekend && (
                      <li>• Weekend mode: Focus on personal tasks and planning</li>
                    )}
                    {!getTimeContext(currentTime).isWorkingHours && getTimeContext(currentTime).isBusinessDay && (
                      <li>• After hours: Personal tasks and tomorrow's preparation</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
