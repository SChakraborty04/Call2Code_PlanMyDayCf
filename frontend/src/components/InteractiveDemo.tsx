import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Brain, Calendar, CheckCircle, Clock, Play, Sparkles } from "lucide-react";
import { useTimeOfDay } from "../hooks/useTimeOfDay";

interface Task {
  id: number;
  title: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  category: string;
}

const sampleTasks: Task[] = [
  { id: 1, title: "Review quarterly reports", time: "9:00 AM", priority: 'high', completed: false, category: "Work" },
  { id: 2, title: "Team meeting preparation", time: "10:30 AM", priority: 'high', completed: false, category: "Work" },
  { id: 3, title: "Lunch break & walk", time: "12:30 PM", priority: 'medium', completed: false, category: "Personal" },
  { id: 4, title: "Client presentation", time: "2:00 PM", priority: 'high', completed: false, category: "Work" },
  { id: 5, title: "Gym workout", time: "6:00 PM", priority: 'medium', completed: false, category: "Health" },
  { id: 6, title: "Plan tomorrow", time: "8:00 PM", priority: 'low', completed: false, category: "Planning" }
];

export const InteractiveDemo = () => {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { timeInfo } = useTimeOfDay();

  const generatePlan = async () => {
    setIsGenerating(true);
    setCurrentStep(0);
    
    // Reset tasks
    setTasks(sampleTasks.map(task => ({ ...task, completed: false })));
    
    // Simulate AI planning process
    const steps = [
      "Analyzing your preferences...",
      "Checking calendar conflicts...",
      "Optimizing for energy levels...",
      "Integrating weather data...",
      "Finalizing your perfect day..."
    ];
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await sleep(800);
    }
    
    // Simulate task completion for demo
    setTimeout(() => {
      setTasks(prev => prev.map((task, index) => 
        index < 2 ? { ...task, completed: true } : task
      ));
    }, 1000);
    
    setIsGenerating(false);
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'low': return 'bg-green-500/10 text-green-600 border-green-200';
    }
  };

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            See <span className="text-gradient">AI Planning</span> in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Experience how our AI agents create personalized daily plans tailored to your schedule, energy levels, and goals.
          </p>
          
            <Button 
              variant="glow" 
              size="lg" 
              onClick={generatePlan} 
              disabled={isGenerating}
              className="text-lg px-8 py-4"
            >
            {isGenerating ? (
              <>
                <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Generate AI Plan
              </>
            )}
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* AI Processing */}
          <Card className="card-ai">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Agent Status
              </CardTitle>
              <CardDescription>
                {timeInfo.greeting} Here's how we're optimizing your day plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  "Analyzing your preferences...",
                  "Checking calendar conflicts...",
                  "Optimizing for energy levels...",
                  "Integrating weather data...",
                  "Finalizing your perfect day..."
                ].map((step, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                      isGenerating && currentStep === index 
                        ? 'bg-primary/10 border border-primary/20' 
                        : isGenerating && currentStep > index
                        ? 'bg-green-500/10 border border-green-200'
                        : 'bg-muted/50'
                    }`}
                  >
                    {isGenerating && currentStep === index ? (
                      <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    ) : isGenerating && currentStep > index ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                    )}
                    <span className={`text-sm ${
                      isGenerating && currentStep >= index ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generated Schedule */}
          <Card className="card-ai">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Your Optimized Schedule
              </CardTitle>
              <CardDescription>
                AI-generated plan based on your patterns and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div 
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                      task.completed 
                        ? 'bg-green-500/10 border-green-200' 
                        : 'bg-background border-border hover:bg-muted/50'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`h-2 w-2 rounded-full ${
                      task.completed ? 'bg-green-500' : 'bg-primary'
                    }`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${
                          task.completed ? 'line-through text-muted-foreground' : ''
                        }`}>
                          {task.title}
                        </span>
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {task.time}
                        <span>•</span>
                        <span>{task.category}</span>
                      </div>
                    </div>
                    
                    {task.completed && (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

// Helper function for delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));