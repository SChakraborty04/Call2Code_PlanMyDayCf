
import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PreferencesOnboarding } from './PreferencesOnboarding';
import { TaskKanban } from './TaskKanban';
import { TasksOverview } from './TasksOverview';
import { AIGenerator } from './AIGenerator';
import { PerformanceInsights } from './PerformanceInsights';
import { WeatherDisplay } from './WeatherDisplay';
import { ApodDisplay } from './ApodDisplay';
import { apiClient, useApiAuth } from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, LogOut, Settings, Sparkles, KanbanSquare, Plus, Brain, Trash2, RefreshCw, Sunrise } from 'lucide-react';
import { toast } from 'sonner';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [hasPreferences, setHasPreferences] = useState(false);
  const [activeTab, setActiveTab] = useState('todos');
  const queryClient = useQueryClient();
  
  const { isReady: apiReady } = useApiAuth(); // Initialize API client with Clerk auth

  const { data: preferencesData, isLoading: preferencesLoading, error: preferencesError, refetch: refetchPreferences } = useQuery({
    queryKey: ['preferences'],
    queryFn: apiClient.getPreferences,
    enabled: isLoaded && !!user && apiReady,
    retry: 3,
    retryDelay: 1000,
  });

  // Task archive mutation
  const archiveTasksMutation = useMutation({
    mutationFn: (keepIncomplete: boolean) => {
      console.log("Calling clearTasks API with keepIncomplete:", keepIncomplete);
      return apiClient.archiveTasks(keepIncomplete);
    },
    onSuccess: (data) => {
      console.log("Clear tasks API response:", data);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      const count = data.count || 0;
      const message = data.deletedTasks === "all" ? 
        `All tasks deleted successfully! (${count} tasks removed)` : 
        `Completed tasks deleted successfully! (${count} tasks removed)`;
      toast.success(message);
    },
    onError: (error: any) => {
      console.error("Clear tasks API error:", error);
      toast.error(`Failed to delete tasks: ${error.message}`);
    }
  });

  useEffect(() => {
    console.log('Dashboard state:', {
      isLoaded,
      user: !!user,
      apiReady,
      preferencesData,
      preferencesLoading,
      preferencesError,
      hasPreferences
    });
    
    if (preferencesData?.preferences) {
      setHasPreferences(true);
    }
  }, [preferencesData, isLoaded, user, preferencesLoading, preferencesError, hasPreferences, apiReady]);

  const handlePreferencesComplete = () => {
    setHasPreferences(true);
    // Refetch preferences after they are saved
    refetchPreferences();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      // Still navigate away as fallback
      navigate('/');
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle clearing all tasks
  const handleClearAllTasks = () => {
    archiveTasksMutation.mutate(false);
  };

  // Handle keeping incomplete tasks but clearing completed ones
  const handleClearCompletedTasks = () => {
    archiveTasksMutation.mutate(true);
  };

  if (!isLoaded || !apiReady || preferencesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {!isLoaded ? 'Loading authentication...' : 
             !apiReady ? 'Initializing API...' : 
             'Loading your dashboard...'}
          </p>
          {preferencesError && (
            <div className="mt-4">
              <p className="text-red-500 text-sm mb-2">
                Error: {preferencesError.message}
              </p>
              <Button onClick={() => refetchPreferences()} variant="outline" size="sm">
                Retry Loading
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/');
    return null;
  }

  // Fresh Start component that's consistent across tabs
  const FreshStartSection = () => (
    <div className="mb-6 mt-2">
      <Alert variant="default" className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <Sunrise className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-700 dark:text-amber-300">Need a Fresh Start?</AlertTitle>
        <AlertDescription className="text-amber-600 dark:text-amber-400">
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-amber-300 dark:border-amber-700 bg-white dark:bg-black hover:bg-amber-100 dark:hover:bg-amber-950"
                  disabled={archiveTasksMutation.isPending}
                >
                  {archiveTasksMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-700 mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Delete All Tasks
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove ALL your tasks, both completed and in-progress. 
                    This action cannot be undone and all tasks will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearAllTasks}
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    Yes, Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-amber-300 dark:border-amber-700 bg-white dark:bg-black hover:bg-amber-100 dark:hover:bg-amber-950"
                  disabled={archiveTasksMutation.isPending}
                >
                  {archiveTasksMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-700 mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Only Completed
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete completed tasks?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all completed tasks while keeping your in-progress 
                    and planned tasks. This action cannot be undone and completed tasks will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearCompletedTasks}
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    Yes, Delete Completed
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">PlanMyDay</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.firstName || 'User'}
            </span>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          {!hasPreferences ? (
            <PreferencesOnboarding onComplete={handlePreferencesComplete} />
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gradient mb-4">
                  Welcome back, {user?.firstName || 'there'}!
                </h1>
                <p className="text-xl text-muted-foreground">
                  Let's make today productive with your AI-powered schedule
                </p>
              </div>

              <Tabs defaultValue="todos" className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="todos" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Todos
                  </TabsTrigger>
                  <TabsTrigger value="kanban" className="flex items-center gap-2">
                    <KanbanSquare className="h-4 w-4" />
                    Kanban Flow
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    AI Generator
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Insights
                  </TabsTrigger>
                </TabsList>

                {/* Show Fresh Start option only for todo and kanban tabs */}
                {(activeTab === 'todos' || activeTab === 'kanban') && <FreshStartSection />}

                <TabsContent value="todos" className="mt-2">
                  <TasksOverview />
                </TabsContent>

                <TabsContent value="kanban" className="mt-2">
                  <div className="min-h-[600px] rounded-lg border border-border overflow-auto">
                    <TaskKanban />
                  </div>
                </TabsContent>

                <TabsContent value="ai" className="mt-6">
                  <AIGenerator />
                </TabsContent>

                <TabsContent value="insights" className="mt-6">
                  <div className="space-y-6">
                    <PerformanceInsights />
                    <div className="grid md:grid-cols-2 gap-6">
                      <WeatherDisplay />
                      <ApodDisplay />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
