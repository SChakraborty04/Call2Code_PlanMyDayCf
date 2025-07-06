
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { apiClient, useApiAuth } from '../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Clock, AlertCircle, Mic } from 'lucide-react';
import { VoiceAgent } from './VoiceAgent';

export const AddTaskForm = () => {
  const { isReady: apiReady } = useApiAuth(); // Initialize API client with Clerk auth
  
  const [task, setTask] = useState({
    title: '',
    duration: 30,
    importance: 'medium',
    scheduledTime: ''
  });
  const [isOpen, setIsOpen] = useState(false);
  const [showVoiceAgent, setShowVoiceAgent] = useState(false);
  
  const queryClient = useQueryClient();

  // Handle "Add Task Manually" button click
  const handleAddTaskClick = () => {
    // Always hide voice agent when showing manual form
    setShowVoiceAgent(false);
    // Toggle the form
    setIsOpen(!isOpen);
  };
  
  // Handle "Voice Input" button click
  const handleVoiceInputClick = () => {
    // Always close manual form when showing voice agent
    setIsOpen(false);
    // Toggle voice agent
    setShowVoiceAgent(!showVoiceAgent);
  };

  const createTaskMutation = useMutation({
    mutationFn: (taskData: { title: string; duration: number; importance: string; status?: string; scheduledTime?: string }) => 
      apiClient.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task added successfully!');
      setTask({ title: '', duration: 30, importance: 'medium', scheduledTime: '' });
      setIsOpen(false);
      setShowVoiceAgent(false); // Also hide voice agent when task is added
    },
    onError: (error: any) => {
      toast.error('Failed to add task: ' + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    
    const taskData = {
      title: task.title,
      duration: task.duration,
      importance: task.importance,
      status: 'todo', // Default status for tasks added via AddTaskForm
      ...(task.scheduledTime && { scheduledTime: task.scheduledTime })
    };
    
    createTaskMutation.mutate(taskData);
  };

  if (!isOpen) {
    return (
      <div className="flex flex-col gap-4">
        {/* Quick Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleAddTaskClick} 
            disabled={!apiReady}
            className="flex-1"
            variant={isOpen ? "default" : "outline"}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task Manually
          </Button>
          <Button 
            onClick={handleVoiceInputClick} 
            disabled={!apiReady}
            variant={showVoiceAgent ? "default" : "outline"}
            className="flex-1"
          >
          <Mic className="h-4 w-4 mr-2" />
          Voice Input
        </Button>
        </div>

        {/* Voice Agent */}
        {showVoiceAgent && (
          <div className="mt-4">
            <VoiceAgent />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Always show Quick Action Buttons */}
      <div className="flex gap-2">
        <Button 
          onClick={handleAddTaskClick} 
          disabled={!apiReady}
          className="flex-1"
          variant={isOpen ? "default" : "outline"}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task Manually
        </Button>
        <Button 
          onClick={handleVoiceInputClick} 
          disabled={!apiReady}
          variant={showVoiceAgent ? "default" : "outline"}
          className="flex-1"
        >
          <Mic className="h-4 w-4 mr-2" />
          Voice Input
        </Button>
      </div>

      {/* Voice Agent */}
      {showVoiceAgent && (
        <div className="mt-4">
          <VoiceAgent />
        </div>
      )}

      {/* Add Task Form Card */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Task
          </CardTitle>
          <CardDescription>
            Create a new task to add to your todo list
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="What needs to be done?"
              value={task.title}
              onChange={(e) => setTask(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <Label htmlFor="scheduledTime">Scheduled Time (Optional)</Label>
            </div>
            <Input
              id="scheduledTime"
              type="time"
              value={task.scheduledTime}
              onChange={(e) => setTask(prev => ({ ...prev, scheduledTime: e.target.value }))}
              placeholder="Select time"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <Label htmlFor="duration">Duration (minutes)</Label>
              </div>
              <Select
                value={task.duration.toString()}
                onValueChange={(value) => setTask(prev => ({ ...prev, duration: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="180">3 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                <Label htmlFor="importance">Importance</Label>
              </div>
              <Select
                value={task.importance}
                onValueChange={(value) => setTask(prev => ({ ...prev, importance: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="ai"
              disabled={createTaskMutation.isPending}
              className="flex-1"
            >
              {createTaskMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    </div>
  );
};
