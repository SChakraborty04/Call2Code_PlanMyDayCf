
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { apiClient, useApiAuth } from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckSquare, Clock, AlertCircle, Trash2, Calendar } from 'lucide-react';
import { AddTaskForm } from './AddTaskForm';

export const TasksOverview = () => {
  const { isReady: apiReady } = useApiAuth(); // Initialize API client with Clerk auth
  
  const queryClient = useQueryClient();

  const { data: tasksData, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: apiClient.getTasks,
    enabled: apiReady,
    retry: 3,
    retryDelay: 1000,
  });

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

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-medium">Failed to load tasks</h3>
            <p className="text-sm">{error.message}</p>
          </div>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const tasks = tasksData?.tasks || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Your Tasks
          </CardTitle>
          <CardDescription>
            Manage your todo list and track your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddTaskForm />
        </CardContent>
      </Card>

      {tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Current Tasks ({tasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.map((task: any) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{task.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{task.duration}min</span>
                      </div>
                      {task.scheduledTime && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className="font-medium text-primary">
                            {task.scheduledTime}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <Badge
                          variant="outline"
                          className={
                            task.importance === 'high'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : task.importance === 'medium'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }
                        >
                          {task.importance}
                        </Badge>
                      </div>
                      {task.status && (
                        <Badge
                          variant="secondary"
                          className={
                            task.status === 'done'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : task.status === 'doing'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : task.status === 'todo'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }
                        >
                          {task.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={deleteTaskMutation.isPending}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {tasks.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No tasks yet</h3>
            <p className="text-muted-foreground">
              Start by adding your first task above to get organized!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
