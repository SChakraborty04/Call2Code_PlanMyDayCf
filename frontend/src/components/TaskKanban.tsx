"use client";

import React, {
  Dispatch,
  SetStateAction,
  useState,
  DragEvent,
  FormEvent,
} from "react";
import { FiPlus, FiTrash } from "react-icons/fi";
import { motion } from "framer-motion";
import { FaFire } from "react-icons/fa";
import { cn } from "../lib/utils";
import { apiClient, useApiAuth } from "../lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LiveClock } from "./LiveClock";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Sparkles, Clock, Settings, Plus, Trash2 } from "lucide-react";
import { KanbanAI } from "./KanbanAI";
import { useGame } from "../contexts/GameContext";

type ColumnType = "backlog" | "todo" | "doing" | "done";

type CardType = {
  title: string;
  id: string;
  column: ColumnType;
  duration?: number;
  importance?: string;
  scheduledTime?: string; // HH:MM format
};

export const TaskKanban = () => {
  return (
    <div className={cn("w-full bg-background text-foreground flex flex-col min-h-0")}>
      <LiveClock />
      <div className="flex-1 min-h-0">
        <Board />
      </div>
    </div>
  );
};

const Board = () => {
  const { isReady: apiReady } = useApiAuth(); // Initialize API client with Clerk auth
  const queryClient = useQueryClient();
  const { openGame, setGameLoading } = useGame(); // Use the game context
  
  const [customPrompts, setCustomPrompts] = useState<string[]>(['']);
  const [showCustomPromptsDialog, setShowCustomPromptsDialog] = useState(false);
  
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: apiClient.getTasks,
    enabled: apiReady,
  });

  const [cards, setCards] = useState<CardType[]>([]);

  // Dynamic columns configuration
  const columns = [
    { id: 'backlog', title: 'Backlog', color: 'text-muted-foreground' },
    { id: 'todo', title: 'To Do', color: 'text-yellow-500' },
    { id: 'doing', title: 'In Progress', color: 'text-blue-500' },
    { id: 'done', title: 'Completed', color: 'text-green-500' },
  ];

  React.useEffect(() => {
    if (tasksData?.tasks) {
      const kanbanCards = tasksData.tasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        column: (task.status || 'todo') as ColumnType,
        duration: task.duration,
        importance: task.importance,
        scheduledTime: task.scheduledTime,
      }));
      setCards(kanbanCards);
    }
  }, [tasksData]);

  const deleteTaskMutation = useMutation({
    mutationFn: apiClient.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete task: ' + error.message);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) => 
      apiClient.updateTask(taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task status updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update task: ' + error.message);
    },
  });

  const generateTasksMutation = useMutation({
    mutationFn: async () => {
      // Get current plan to ensure alignment
      const planData = await apiClient.getPlan();
      const existingPlan = planData?.plan;
      
      // Get valid custom prompts
      const validPrompts = customPrompts.filter(p => p && p.trim().length > 0);
      
      // Generate tasks that align with existing schedule
      return apiClient.generateAITasks({ 
        existingPlan,
        alignWithSchedule: true,
        customPrompts: validPrompts.length > 0 ? validPrompts : undefined
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['plan'] }); // Refresh plan as well
      toast.success('AI tasks generated successfully and aligned with your schedule!');
      setShowCustomPromptsDialog(false);
      // Update game loading state but don't close the modal
      setGameLoading(false);
    },
    onError: (error: any) => {
      toast.error('Failed to generate AI tasks: ' + error.message);
      // Update game loading state but don't close the modal
      setGameLoading(false);
    },
  });

  const alignTasksMutation = useMutation({
    mutationFn: apiClient.alignTasksWithPlan,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      const { alignment } = data;
      
      const actions = [];
      if (alignment.inserted > 0) actions.push(`${alignment.inserted} added`);
      if (alignment.modified > 0) actions.push(`${alignment.modified} modified`);
      if (alignment.deleted > 0) actions.push(`${alignment.deleted} removed`);
      
      const actionText = actions.length > 0 ? actions.join(', ') : 'analyzed';
      toast.success(`Tasks aligned with AI plan: ${actionText}`);
      
      if (alignment.conflicts > 0) {
        toast.warning(`${alignment.conflicts} conflicts detected - check your tasks`);
      }
      
      // Update game loading state but don't close the modal
      setGameLoading(false);
    },
    onError: (error: any) => {
      toast.error('Failed to align tasks: ' + error.message);
      
      // Update game loading state but don't close the modal
      setGameLoading(false);
    },
  });

  const handleDeleteCard = (cardId: string) => {
    deleteTaskMutation.mutate(cardId);
    setCards(prev => prev.filter(c => c.id !== cardId));
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

  const handleGenerateWithPrompts = () => {
    // Explicitly open the game before starting the mutation
    openGame(true, "Generating AI tasks with custom instructions... Have fun while you wait!");
    generateTasksMutation.mutate();
  };

  // Use the game context to show the game during loading
  React.useEffect(() => {
    if (isLoading) {
      openGame(true, "Loading your tasks... Play this game while you wait!");
    }
  }, [isLoading, openGame]);

  React.useEffect(() => {
    if (alignTasksMutation.isPending || generateTasksMutation.isPending) {
      openGame(
        true, 
        alignTasksMutation.isPending ? 
          "Aligning tasks with AI plan... Enjoy a quick game!" : 
          "Generating AI tasks... Have fun while you wait!"
      );
    } else if (!isLoading) {
      // Only update loading state, don't close the game
      setGameLoading(false);
    }
  }, [alignTasksMutation.isPending, generateTasksMutation.isPending, openGame, setGameLoading, isLoading]);

  // Return the board UI if not loading
  if (isLoading || alignTasksMutation.isPending || generateTasksMutation.isPending) {
    // Don't render a loading state here, as the game is shown via the modal
    // Just return an empty fragment so the UI doesn't flash
    return <></>;
  }
  
  return (
    <div className="w-full flex flex-col min-h-0">
      <div className="flex-shrink-0 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Task Flow</h2>
          <div className="flex gap-2">
            <KanbanAI />
            <Dialog open={showCustomPromptsDialog} onOpenChange={setShowCustomPromptsDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Custom AI Tasks
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Generate AI Tasks with Custom Instructions</DialogTitle>
                  <DialogDescription>
                    Add custom instructions to generate tasks that align with your schedule and preferences.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label className="font-medium">Custom Instructions (Optional)</Label>
                    <p className="text-sm text-muted-foreground">
                      Add specific instructions for the AI (e.g., "Focus on creative tasks", "Include outdoor activities", "Plan around meetings")
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
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowCustomPromptsDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleGenerateWithPrompts}
                      disabled={generateTasksMutation.isPending}
                      className="flex-1"
                      variant="default"
                    >
                      {generateTasksMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate AI Tasks
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              onClick={() => {
                // Explicitly open the game before starting the mutation
                openGame(true, "Generating AI tasks... Have fun while you wait!");
                generateTasksMutation.mutate();
              }}
              disabled={generateTasksMutation.isPending}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {generateTasksMutation.isPending ? 'Generating...' : 'Quick AI Tasks'}
            </Button>
            
            <Button 
              onClick={() => {
                // Explicitly open the game before starting the mutation
                openGame(true, "Aligning tasks with AI plan... Enjoy a quick game!");
                alignTasksMutation.mutate();
              }}
              disabled={alignTasksMutation.isPending}
              variant="outline"
              className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-950"
            >
              <Settings className="h-4 w-4" />
              {alignTasksMutation.isPending ? 'Aligning...' : 'Align with AI Plan'}
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <div className="h-full flex gap-6 p-4 overflow-x-auto">
          {columns.map((column) => (
            <Column
              key={column.id}
              title={column.title}
              column={column.id as ColumnType}
              headingColor={column.color}
              cards={cards}
              setCards={setCards}
              onDeleteCard={handleDeleteCard}
              onUpdateTask={updateTaskMutation}
            />
          ))}
          <div className="flex-shrink-0">
            <BurnBarrel setCards={setCards} onDeleteCard={handleDeleteCard} />
          </div>
        </div>
      </div>
    </div>
  );
};

type ColumnProps = {
  title: string;
  headingColor: string;
  cards: CardType[];
  column: ColumnType;
  setCards: Dispatch<SetStateAction<CardType[]>>;
  onDeleteCard: (cardId: string) => void;
  onUpdateTask: any; // Mutation object from react-query
};

const Column = ({
  title,
  headingColor,
  cards,
  column,
  setCards,
  onDeleteCard,
  onUpdateTask,
}: ColumnProps) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, card: CardType) => {
    e.dataTransfer.setData("cardId", card.id);
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    const cardId = e.dataTransfer.getData("cardId");

    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);

    const before = element.dataset.before || "-1";

    if (before !== cardId) {
      let copy = [...cards];

      let cardToTransfer = copy.find((c) => c.id === cardId);
      if (!cardToTransfer) return;
      cardToTransfer = { ...cardToTransfer, column };

      copy = copy.filter((c) => c.id !== cardId);

      const moveToBack = before === "-1";

      if (moveToBack) {
        copy.push(cardToTransfer);
      } else {
        const insertAtIndex = copy.findIndex((el) => el.id === before);
        if (insertAtIndex === undefined) return;

        copy.splice(insertAtIndex, 0, cardToTransfer);
      }

      setCards(copy);
      onUpdateTask.mutate({ taskId: cardId, status: column });
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  };

  const clearHighlights = (els?: HTMLElement[]) => {
    const indicators = els || getIndicators();
    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
  };

  const highlightIndicator = (e: DragEvent<HTMLDivElement>) => {
    const indicators = getIndicators();
    clearHighlights(indicators);
    const el = getNearestIndicator(e, indicators);
    el.element.style.opacity = "1";
  };

  const getNearestIndicator = (e: DragEvent<HTMLDivElement>, indicators: HTMLElement[]) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  const getIndicators = () => {
    return Array.from(
      document.querySelectorAll(
        `[data-column="${column}"]`
      ) as unknown as HTMLElement[]
    );
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const filteredCards = cards.filter((c) => c.column === column);

  return (
    <div className="w-64 flex-shrink-0 flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-medium ${headingColor}`}>{title}</h3>
        <span className="rounded text-sm text-muted-foreground">
          {filteredCards.length}
        </span>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex-1 min-h-96 max-h-[70vh] overflow-y-auto transition-colors rounded-lg p-2 ${
          active ? "bg-muted/50" : "bg-transparent"
        }`}
      >
        <div className="space-y-2">
          {filteredCards.map((c) => {
            return <Card key={c.id} {...c} handleDragStart={handleDragStart} />;
          })}
          <DropIndicator beforeId={null} column={column} />
          <AddCard column={column} setCards={setCards} />
        </div>
      </div>
    </div>
  );
};

type CardProps = CardType & {
  handleDragStart: (e: DragEvent<HTMLDivElement>, card: CardType) => void;
};

const Card = ({ title, id, column, duration, importance, scheduledTime, handleDragStart }: CardProps) => {
  const [editingTime, setEditingTime] = useState(false);
  const [timeValue, setTimeValue] = useState(scheduledTime || '');
  const queryClient = useQueryClient();

  const updateTimeMutation = useMutation({
    mutationFn: (scheduledTime: string) => 
      apiClient.updateTask(id, { scheduledTime }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task time updated successfully');
      setEditingTime(false);
    },
    onError: (error: any) => {
      toast.error('Failed to update time: ' + error.message);
    },
  });

  const handleTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeValue && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeValue)) {
      updateTimeMutation.mutate(timeValue);
    } else if (timeValue === '') {
      updateTimeMutation.mutate('');
    } else {
      toast.error('Please enter time in HH:MM format');
    }
  };

  return (
    <>
      <DropIndicator beforeId={id} column={column} />
      <div
        draggable="true"
        onDragStart={(e) => handleDragStart(e, { title, id, column, duration, importance, scheduledTime })}
        className="cursor-grab rounded bg-card p-3 active:cursor-grabbing hover:bg-accent/50 transition-colors mb-2 shadow-sm"
      >
        <p className="text-sm font-medium text-foreground">{title}</p>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {duration && (
              <span className="text-xs text-muted-foreground">{duration}min</span>
            )}
            {importance && (
              <span className={`inline-block px-2 py-1 rounded text-xs ${
                importance === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                importance === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {importance}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {editingTime ? (
              <form onSubmit={handleTimeSubmit} className="flex items-center gap-1">
                <input
                  type="time"
                  value={timeValue}
                  onChange={(e) => setTimeValue(e.target.value)}
                  className="text-xs border border-border rounded px-1 py-0.5 bg-background"
                  autoFocus
                />
                <button type="submit" className="text-xs text-green-600 hover:text-green-700">✓</button>
                <button 
                  type="button" 
                  onClick={() => setEditingTime(false)}
                  className="text-xs text-red-600 hover:text-red-700"
                >✕</button>
              </form>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTime(true);
                }}
                className="text-xs text-primary hover:text-primary/70 flex items-center gap-1"
              >
                <Clock className="h-3 w-3" />
                {scheduledTime || 'Add time'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

type DropIndicatorProps = {
  beforeId: string | null;
  column: string;
};

const DropIndicator = ({ beforeId, column }: DropIndicatorProps) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="my-0.5 h-0.5 w-full bg-primary opacity-0"
    />
  );
};

const BurnBarrel = ({
  setCards,
  onDeleteCard,
}: {
  setCards: Dispatch<SetStateAction<CardType[]>>;
  onDeleteCard: (cardId: string) => void;
}) => {
  const [active, setActive] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setActive(true);
  };

  const handleDragLeave = () => {
    setActive(false);
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    const cardId = e.dataTransfer.getData("cardId");
    onDeleteCard(cardId);
    setCards((pv) => pv.filter((c) => c.id !== cardId));
    setActive(false);
  };

  return (
    <div
      onDrop={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl transition-colors ${
        active
          ? "border-red-500 bg-red-500/20 text-red-500"
          : "border-muted-foreground bg-muted/20 text-muted-foreground"
      }`}
    >
      {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
    </div>
  );
};

type AddCardProps = {
  column: ColumnType;
  setCards: Dispatch<SetStateAction<CardType[]>>;
};

const AddCard = ({ column, setCards }: AddCardProps) => {
  const [task, setTask] = useState({
    title: '',
    duration: 30,
    importance: 'medium',
    scheduledTime: ''
  });
  const [adding, setAdding] = useState(false);
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: (taskData: { title: string; duration: number; importance: string; status: string; scheduledTime?: string }) => 
      apiClient.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create task: ' + error.message);
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!task.title.trim().length) return;

    const taskData = {
      title: task.title.trim(),
      duration: task.duration,
      importance: task.importance,
      status: column, // Set status based on the column
      ...(task.scheduledTime && { scheduledTime: task.scheduledTime })
    };

    createTaskMutation.mutate(taskData);

    // Optimistic update - add to local state immediately
    const newCard = {
      column,
      title: task.title.trim(),
      id: Math.random().toString(), // Temporary ID until DB response
      duration: task.duration,
      importance: task.importance,
      scheduledTime: task.scheduledTime || undefined,
    };

    setCards((pv) => [...pv, newCard]);
    
    // Reset form
    setTask({ title: '', duration: 30, importance: 'medium', scheduledTime: '' });
    setAdding(false);
  };

  const resetForm = () => {
    setTask({ title: '', duration: 30, importance: 'medium', scheduledTime: '' });
    setAdding(false);
  };

  return (
    <>
      {adding ? (
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Task Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Task Title *</label>
              <textarea
                value={task.title}
                onChange={(e) => setTask(prev => ({ ...prev, title: e.target.value }))}
                autoFocus
                placeholder="What needs to be done?"
                className="w-full rounded border border-border bg-background p-3 text-sm text-foreground placeholder-muted-foreground focus:outline-0 focus:ring-2 focus:ring-primary resize-none min-h-[60px]"
                rows={2}
                required
              />
            </div>

            {/* Duration and Importance */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Duration
                </label>
                <select
                  value={task.duration}
                  onChange={(e) => setTask(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full text-sm border border-border rounded px-3 py-2 bg-background focus:outline-0 focus:ring-2 focus:ring-primary"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Priority</label>
                <select
                  value={task.importance}
                  onChange={(e) => setTask(prev => ({ ...prev, importance: e.target.value }))}
                  className="w-full text-sm border border-border rounded px-3 py-2 bg-background focus:outline-0 focus:ring-2 focus:ring-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Scheduled Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Scheduled Time (Optional)
              </label>
              <input
                type="time"
                value={task.scheduledTime}
                onChange={(e) => setTask(prev => ({ ...prev, scheduledTime: e.target.value }))}
                className="w-full text-sm border border-border rounded px-3 py-2 bg-background focus:outline-0 focus:ring-2 focus:ring-primary"
                placeholder="Select time"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground border border-border rounded hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!task.title.trim() || createTaskMutation.isPending}
                className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createTaskMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <FiPlus className="h-4 w-4" />
                    <span>Add Task</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50 rounded border-2 border-dashed border-muted-foreground/30 hover:border-primary/50"
        >
          <FiPlus className="h-3 w-3" />
          <span>Add new task</span>
        </button>
      )}
    </>
  );
};
