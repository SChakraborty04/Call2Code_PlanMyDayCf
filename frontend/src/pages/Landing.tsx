
import { ThemeToggle } from "../components/ThemeToggle";
import { HeroSection } from "../components/HeroSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { InteractiveDemo } from "../components/InteractiveDemo";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { Calendar, Github, Star, Users, Zap } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export const Landing = () => {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">PlanMyDay</span>
          </div>
          
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, {user?.firstName || 'there'}!
                </span>
                <Button size="sm" variant="ai" onClick={handleDashboardClick}>
                  Dashboard
                </Button>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm" variant="ai">
                    Get Started
                  </Button>
                </SignUpButton>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <InteractiveDemo />
        
        {/* Social Proof Section */}
        <section className="py-24 px-4 bg-muted/30">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Trusted by <span className="text-gradient">Thousands</span> of Productive People
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
              <Card className="card-ai">
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-bold text-gradient">10,000+</CardTitle>
                  <CardDescription>Active Users</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="card-ai">
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-bold text-gradient">2M+</CardTitle>
                  <CardDescription>Tasks Planned</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="card-ai">
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Star className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-bold text-gradient">4.9★</CardTitle>
                  <CardDescription>User Rating</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4">
          <div className="container mx-auto text-center">
            <Card className="card-ai max-w-4xl mx-auto">
              <CardContent className="p-12">
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  Ready to <span className="text-gradient">Transform</span> Your Day?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of professionals who have revolutionized their productivity with AI-powered day planning.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  {isSignedIn ? (
                    <Button size="lg" variant="ai" className="text-lg px-8 py-4" onClick={handleDashboardClick}>
                      <Calendar className="mr-2 h-5 w-5" />
                      Go to Dashboard
                    </Button>
                  ) : (
                    <SignUpButton mode="modal">
                      <Button size="lg" variant="ai" className="text-lg px-8 py-4">
                        <Calendar className="mr-2 h-5 w-5" />
                        Start Your AI Journey Today
                      </Button>
                    </SignUpButton>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                      FREE
                    </Badge>
                    <span>No credit card required</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-gradient-primary rounded-md flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-gradient">PlanMyDay</span>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              © 2024 PlanMyDay. Powered by AI agents that understand your productivity.
            </p>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Github className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
