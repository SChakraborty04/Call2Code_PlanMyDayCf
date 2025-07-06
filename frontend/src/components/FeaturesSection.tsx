import { Brain, Calendar, Cloud, Lightbulb, Target, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Planning",
    description: "Our intelligent agents analyze your tasks, deadlines, and preferences to create optimal daily schedules."
  },
  {
    icon: Target,
    title: "Smart Prioritization",
    description: "Automatically rank tasks by importance, urgency, and your personal productivity patterns."
  },
  {
    icon: Calendar,
    title: "Dynamic Scheduling",
    description: "Adaptive schedules that adjust in real-time based on your progress and changing priorities."
  },
  {
    icon: Cloud,
    title: "Weather Integration",
    description: "Plans adapt to weather conditions, suggesting indoor/outdoor activities accordingly."
  },
  {
    icon: Zap,
    title: "Energy Optimization",
    description: "Schedule demanding tasks when you're most energetic and lighter tasks during low-energy periods."
  },
  {
    icon: Lightbulb,
    title: "Intelligent Insights",
    description: "Get personalized recommendations and insights to continuously improve your productivity."
  }
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-gradient">Intelligent Features</span> for Smarter Planning
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of productivity with AI agents that understand your unique workflow and optimize every moment of your day.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="card-ai animate-fade-in" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-xl w-fit">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};