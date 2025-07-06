import React from 'react';
import { useAuth } from '@clerk/clerk-react';

// Dynamic API base URL - use environment variable or fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private getToken: (() => Promise<string | null>) | null = null;

  setAuthProvider = (getToken: () => Promise<string | null>) => {
    this.getToken = getToken;
    console.log('API Client: Auth provider set');
  }

  private getAuthHeaders = async () => {
    let token = null;
    if (this.getToken) {
      try {
        token = await this.getToken();
        console.log('Auth token status:', {
          hasToken: !!token,
          tokenLength: token?.length
        });
      } catch (error) {
        console.error('Failed to get auth token:', error);
      }
    } else {
      console.warn('No auth token provider set');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add ngrok headers only if using ngrok
    if (API_BASE_URL.includes('ngrok')) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }

    return headers;
  }

  private request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    if (!this.getToken) {
      throw new Error('API client not initialized. Make sure to call useApiAuth() in your component.');
    }
    
    const headers = await this.getAuthHeaders();
    
    console.log('API Request:', {
      url: `${API_BASE_URL}${endpoint}`,
      method: options.method || 'GET',
      hasAuth: !!headers['Authorization']
    });
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    const responseData = await response.json();
    
    console.log('API Response:', {
      status: response.status,
      ok: response.ok,
      data: responseData
    });

    if (!response.ok) {
      throw new Error(responseData.error || `HTTP ${response.status}`);
    }

    return responseData;
  }

  // Preferences
  getPreferences = async () => {
    return this.request<{ preferences: any }>('/api/preferences');
  }

  savePreferences = async (preferences: any) => {
    return this.request('/api/preferences', {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  }

  // Tasks
  getTasks = async () => {
    return this.request<{ tasks: any[] }>('/api/tasks');
  }

  createTask = async (task: { title: string; duration: number; importance: string; status?: string; scheduledTime?: string }) => {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  deleteTask = async (taskId: string) => {
    return this.request(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  updateTask = async (taskId: string, updates: { status?: string; scheduledTime?: string }) => {
    return this.request(`/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Plan
  generatePlan = async (options?: { customPrompts?: string[] }) => {
    return this.request<{ plan: any }>('/api/plan', {
      method: 'POST',
      body: options ? JSON.stringify(options) : undefined,
    });
  }

  generateAITasks = async (options?: { 
    customPrompts?: string[]; 
    existingPlan?: any; 
    alignWithSchedule?: boolean 
  }) => {
    return this.request<{ tasks: any[] }>('/api/generate-tasks', {
      method: 'POST',
      body: options ? JSON.stringify(options) : undefined,
    });
  }

  alignTasksWithPlan = async () => {
    return this.request<{
      ok: boolean;
      message: string;
      alignment: {
        inserted: number;
        modified: number;
        deleted: number;
        conflicts: number;
        insertedTasks: any[];
        modifiedTasks: any[];
        deletedTasks: any[];
        conflictDetails: any[];
      };
      debug?: {
        modelUsed: string;
        attemptCount: number;
        planFound: boolean;
        existingTaskCount: number;
        generatedTaskCount: number;
      };
    }>('/api/align-tasks-with-plan', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  extractTasksFromVoice = async (transcript: string) => {
    return this.request<{ 
      ok: boolean; 
      tasks: any[]; 
      originalTranscript: string; 
      extractedCount: number;
      debug?: {
        aiResponse: string;
        rawTasksCount: number;
        validTasksCount: number;
        processingSuccess: boolean;
        modelUsed: string;
      };
    }>('/api/extract-tasks', {
      method: 'POST',
      body: JSON.stringify({ transcript }),
    });
  }

  getPlan = async () => {
    return this.request<{ plan: any }>('/api/plan');
  }

  // Weather
  getWeather = async () => {
    return this.request<any>('/api/weather');
  }

  // NASA APOD (Astronomy Picture of the Day)
  getApod = async (date?: string) => {
    const url = date ? `/api/apod?date=${date}` : '/api/apod';
    return this.request<{
      success: boolean;
      data: {
        url: string;
        title: string;
        explanation: string;
        media_type: string;
        hdurl?: string;
        date: string;
      };
      message: string;
    }>(url);
  }

  // Get random APOD from the past month
  getRandomApod = async () => {
    return this.request<{
      success: boolean;
      data: {
        url: string;
        title: string;
        explanation: string;
        media_type: string;
        hdurl?: string;
        date: string;
      };
      message: string;
    }>('/api/apod/random');
  }

  // KanbanAI methods
  dictateKanbanTasks = async () => {
    return this.request<{
      ok: boolean;
      dictation: string;
      taskCount: number;
      breakdown: {
        backlog: number;
        todo: number;
        doing: number;
        done: number;
      };
      debug?: {
        modelUsed: string;
        attemptCount: number;
      };
    }>('/api/kanban-ai/dictate', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  askKanbanAI = async (question: string) => {
    return this.request<{
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
    }>('/api/kanban-ai/ask', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  }

  getPerformanceInsights = async () => {
    return this.request<{
      ok: boolean;
      insights: {
        summary: {
          totalTasks: number;
          completedTasks: number;
          inProgressTasks: number;
          completionRate: number;
          timeUtilization: number;
          totalPlannedTime: number;
          completedTime: number;
        };
        priorities: {
          high: number;
          medium: number;
          low: number;
        };
        breakdown: {
          backlog: any[];
          todo: any[];
          doing: any[];
          done: any[];
        };
        trends: any;
        aiAnalysis: string;
        context: {
          timeOfDay: string;
          isWeekend: boolean;
          hasPlan: boolean;
          peakFocus?: string;
        };
        lastUpdated: string;
      };
      debug?: {
        modelUsed: string;
        attemptCount: number;
        tasksAnalyzed: number;
        weeklyDataPoints: number;
      };
    }>('/api/performance-insights', {
      method: 'GET',
    });
  }

  // Game high score
  saveGameHighScore = async (score: number) => {
    return this.request('/api/game-score', {
      method: 'POST',
      body: JSON.stringify({ score }),
    });
  }

  getGameHighScore = async () => {
    return this.request<{ highScore: number }>('/api/game-score');
  }

  getUserHighScore = async () => {
    return this.request<{ highScore: number, hasScore: boolean, allTimeHigh: number }>('/api/userhighscore');
  }

  archiveTasks = async (keepIncomplete: boolean = false) => {
    return this.request<{ message: string, deletedTasks: string, count: number }>('/api/clear-tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keepIncomplete }),
    });
  }
}

export const apiClient = new ApiClient();

// Hook to initialize API client with Clerk auth
export const useApiAuth = () => {
  const { getToken, isLoaded } = useAuth();
  
  React.useEffect(() => {
    console.log('useApiAuth effect:', { isLoaded, hasGetToken: !!getToken });
    if (isLoaded && getToken) {
      console.log('Setting auth provider for API client');
      apiClient.setAuthProvider(getToken);
    }
  }, [getToken, isLoaded]);
  
  // Double check that the API client has the methods
  React.useEffect(() => {
    console.log('API Client methods check:', {
      hasGetPreferences: typeof apiClient.getPreferences === 'function',
      hasGetTasks: typeof apiClient.getTasks === 'function',
      apiClientInstance: !!apiClient
    });
  }, []);
  
  return { isReady: isLoaded && !!getToken };
};
