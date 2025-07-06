import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, useApiAuth } from '../lib/api';
import { GameHighScoreCard } from './GameHighScoreCard';
import { GameContext } from '../contexts/GameContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Brain, 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  RefreshCw,
  BarChart3,
  Calendar,
  Zap,
  Award,
  AlertCircle,
  Users,
  Timer,
  Activity,
  Trophy,
  Gamepad
} from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  muted: '#6b7280'
};

const CACHE_KEY = 'performance-insights-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const getCachedData = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log('Using cached performance insights data', 
          'Age:', Math.floor((Date.now() - timestamp) / (1000 * 60)), 'minutes');
        return data;
      } else {
        console.log('Cache expired, will fetch fresh data');
      }
    }
  } catch (error) {
    console.warn('Failed to read performance insights cache:', error);
  }
  return null;
};

const setCachedData = (data: any) => {
  try {
    console.log('Caching performance insights data (excluding high score)');
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Failed to cache performance insights:', error);
  }
};

const getCacheAge = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { timestamp } = JSON.parse(cached);
      return Date.now() - timestamp;
    }
  } catch (error) {
    console.warn('Failed to get cache age:', error);
  }
  return null;
};

export const PerformanceInsights = () => {
  const { isReady: apiReady } = useApiAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [useCache, setUseCache] = useState(false);
  const gameContext = useContext(GameContext);

  // Check if we have valid cached data on component mount
  useEffect(() => {
    const cachedData = getCachedData();
    if (cachedData) {
      setUseCache(true);
    }
  }, []);

  const { data: insightsData, isLoading, error, refetch } = useQuery({
    queryKey: ['performance-insights'],
    queryFn: async () => {
      // Try cache first if enabled
      if (useCache && !refreshing) {
        const cachedData = getCachedData();
        if (cachedData) {
          return cachedData;
        }
      }
      
      // Fetch fresh data
      const data = await apiClient.getPerformanceInsights();
      
      // Store cache without highScoreData (we'll fetch that separately)
      const cacheData = { ...data };
      setCachedData(cacheData);
      
      setUseCache(false);
      return data;
    },
    enabled: apiReady,
    staleTime: useCache ? Infinity : 1000 * 60 * 5, // Infinite if using cache, 5 minutes otherwise
    refetchInterval: useCache ? false : 1000 * 60 * 10, // No auto-refetch if using cache
  });

  // Fetch high score data - note this is not cached, always fresh
  // We keep this separate from the main insights data because:
  // 1. Game scores can change frequently, so we want fresh data
  // 2. This ensures the high score is always up-to-date in the UI
  // 3. Prevents stale high score data when cached insights are used
  const { data: highScoreData } = useQuery({
    queryKey: ['user-high-score'],
    queryFn: apiClient.getUserHighScore,
    enabled: apiReady,
    staleTime: 1000 * 60, // 1 minute - refresh more frequently
    refetchInterval: 1000 * 60 * 2, // Auto-refetch every 2 minutes
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      setRefreshing(true);
      setUseCache(false); // Force fresh fetch
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay for UX
      const data = await apiClient.getPerformanceInsights();
      
      // Store cache without highScoreData (we'll fetch that separately)
      const cacheData = { ...data };
      setCachedData(cacheData);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-insights'] });
      // Also invalidate high score to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['user-high-score'] });
      toast.success('Performance insights refreshed!');
    },
    onError: (error: any) => {
      // Fallback to cache if refresh fails
      const cachedData = getCachedData();
      if (cachedData) {
        setUseCache(true);
        queryClient.setQueryData(['performance-insights'], cachedData);
        toast.error('Failed to refresh, using cached data: ' + error.message);
      } else {
        toast.error('Failed to refresh insights: ' + error.message);
      }
    },
    onSettled: () => {
      setRefreshing(false);
    },
  });

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Performance Insights</h2>
          <Button disabled variant="outline">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Loading...
          </Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !insightsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Performance Insights</h2>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Unable to load performance insights
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { insights } = insightsData;
  const { summary, priorities, breakdown, trends, aiAnalysis, context } = insights;

  // Get cache information
  const cacheAge = getCacheAge();
  const isUsingCache = useCache && cacheAge !== null;
  const cacheInfo = isUsingCache 
    ? `Cached ${Math.floor(cacheAge / (1000 * 60 * 60))}h ago`
    : null;

  // Prepare chart data
  const completionData = [
    { name: 'Completed', value: summary.completedTasks, color: COLORS.success },
    { name: 'In Progress', value: summary.inProgressTasks, color: COLORS.warning },
    { name: 'Pending', value: breakdown.todo.length, color: COLORS.primary },
    { name: 'Backlog', value: breakdown.backlog.length, color: COLORS.muted },
  ].filter(item => item.value > 0);

  const priorityData = [
    { name: 'High', value: priorities.high, color: COLORS.danger },
    { name: 'Medium', value: priorities.medium, color: COLORS.warning },
    { name: 'Low', value: priorities.low, color: COLORS.success },
  ].filter(item => item.value > 0);

  const weeklyData = Object.entries(trends).map(([date, data]: [string, any]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    completed: data.completed,
    total: data.total,
    efficiency: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Performance Insights
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-muted-foreground">
              Your productivity overview for {context.timeOfDay} 
              {context.isWeekend ? ' (Weekend)' : ' (Weekday)'}
            </p>
            {cacheInfo && (
              <Badge variant="outline" className="text-xs">
                {cacheInfo}
              </Badge>
            )}
          </div>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing || refreshMutation.isPending}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${(refreshing || refreshMutation.isPending) ? 'animate-spin' : ''}`} />
          {refreshing || refreshMutation.isPending ? 'Refreshing...' : 'Refresh AI Analysis'}
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{summary.completionRate}%</p>
              </div>
            </div>
            <Progress value={summary.completionRate} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tasks Done</p>
                <p className="text-2xl font-bold">{summary.completedTasks}/{summary.totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Used</p>
                <p className="text-2xl font-bold">{summary.timeUtilization}%</p>
              </div>
            </div>
            <Progress value={summary.timeUtilization} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <PlayCircle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{summary.inProgressTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game High Score Card */}
        <GameHighScoreCard />
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Task Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Task Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {completionData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Priority Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {priorityData.map((priority, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={priority.name === 'High' ? 'destructive' : priority.name === 'Medium' ? 'default' : 'secondary'}
                        className="w-16 justify-center"
                      >
                        {priority.name}
                      </Badge>
                      <span className="text-sm text-muted-foreground">tasks</span>
                    </div>
                    <span className="font-bold text-lg">{priority.value}</span>
                  </div>
                  <Progress 
                    value={summary.totalTasks > 0 ? (priority.value / summary.totalTasks) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Completions */}
        {breakdown.done.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-500" />
                Recent Completions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {breakdown.done.slice(0, 4).map((task: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.duration_minutes}min • {task.importance} priority
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Focus */}
        {(breakdown.doing.length > 0 || breakdown.todo.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-blue-500" />
                Current Focus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* In Progress */}
                {breakdown.doing.slice(0, 2).map((task: any, index: number) => (
                  <div key={`doing-${index}`} className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <PlayCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.duration_minutes}min • {task.importance} priority • In Progress
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Next Up */}
                {breakdown.todo.slice(0, 2).map((task: any, index: number) => (
                  <div key={`todo-${index}`} className="flex items-center gap-3 p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <Circle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.duration_minutes}min • {task.importance} priority
                        {task.scheduled_time && ` • ${task.scheduled_time}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Weekly Trend - Separate Row */}
      {weeklyData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Performance Trend
            </CardTitle>
            <CardDescription>
              Your completion rate over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke={COLORS.primary} 
                    strokeWidth={2}
                    name="Completion %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI Performance Analysis
          </CardTitle>
          <CardDescription>
            Personalized insights and recommendations based on your activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed whitespace-pre-line">
              {aiAnalysis}
            </p>

            {/* High Score Integration */}
            {highScoreData && highScoreData.highScore > 0 && (
              <div className="mt-6 p-4 bg-yellow-500/10 dark:bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Your Current High Score: {highScoreData.highScore}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Nice job! You've already played our car game. Take a quick break and try to beat your high score!
                  {highScoreData.allTimeHigh && highScoreData.allTimeHigh > highScoreData.highScore && 
                    ` The all-time high on our platform is ${highScoreData.allTimeHigh}!`
                  }
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-3 flex items-center gap-1" 
                  onClick={() => {
                    if (gameContext) {
                      gameContext.openGame(false, 'Get Ready!');
                    }
                  }}
                >
                  <Gamepad className="h-4 w-4" />
                  Play Now
                </Button>
              </div>
            )}
            {(!highScoreData || highScoreData.highScore === 0) && (
              <div className="mt-6 p-4 bg-primary/10 dark:bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <Gamepad className="h-5 w-5 text-primary" />
                  <span className="font-medium">Need a Break?</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Take a quick break from your tasks and play our car racing game. It's a fun way to reset your mind!
                  {highScoreData?.allTimeHigh > 0 && ` The all-time high on our platform is ${highScoreData.allTimeHigh}!`}
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-3 flex items-center gap-1" 
                  onClick={() => {
                    if (gameContext) {
                      gameContext.openGame(false, 'Get Ready!');
                    }
                  }}
                >
                  <Gamepad className="h-4 w-4" />
                  Play Game
                </Button>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last updated: {new Date(insights.lastUpdated).toLocaleTimeString()}
            {context.hasPlan && (
              <>
                <span>•</span>
                <Calendar className="h-3 w-3" />
                <span>AI Plan Active</span>
              </>
            )}
            {context.peakFocus && (
              <>
                <span>•</span>
                <Zap className="h-3 w-3" />
                <span>Peak: {context.peakFocus}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
