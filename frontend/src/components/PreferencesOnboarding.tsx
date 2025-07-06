import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { apiClient, useApiAuth } from '../lib/api';
import { toast } from 'sonner';
import { Sparkles, Clock, MapPin, Coffee } from 'lucide-react';

interface PreferencesOnboardingProps {
  onComplete: () => void;
}

export const PreferencesOnboarding = ({ onComplete }: PreferencesOnboardingProps) => {
  const { isReady: apiReady } = useApiAuth(); // Initialize API client with Clerk auth
  
  const [preferences, setPreferences] = useState({
    wakeTime: '07:00',
    sleepTime: '23:00',
    peakFocus: 'morning',
    city: '',
    breakStyle: 'walk',
    breakInterval: 60,
    maxWorkHours: 8,
    commuteMode: 'none'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.savePreferences(preferences);
      toast.success('Preferences saved successfully!');
      onComplete();
    } catch (error: any) {
      toast.error('Failed to save preferences: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to PlanMyDay!</CardTitle>
          <CardDescription className="text-lg">
            Let's set up your preferences to create the perfect daily schedule
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Wake and Sleep Times */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <Label htmlFor="wakeTime">Wake Time</Label>
                </div>
                <Input
                  id="wakeTime"
                  type="time"
                  value={preferences.wakeTime}
                  onChange={(e) => updatePreference('wakeTime', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <Label htmlFor="sleepTime">Sleep Time</Label>
                </div>
                <Input
                  id="sleepTime"
                  type="time"
                  value={preferences.sleepTime}
                  onChange={(e) => updatePreference('sleepTime', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Peak Focus Time */}
            <div className="space-y-2">
              <Label>When do you focus best?</Label>
              <Select
                value={preferences.peakFocus}
                onValueChange={(value) => updatePreference('peakFocus', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (6 AM - 12 PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12 PM - 6 PM)</SelectItem>
                  <SelectItem value="evening">Evening (6 PM - 12 AM)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <Label htmlFor="city">Your City</Label>
              </div>
              <Input
                id="city"
                type="text"
                placeholder="e.g., New York, London, Tokyo"
                value={preferences.city}
                onChange={(e) => updatePreference('city', e.target.value)}
                required
              />
            </div>

            {/* Break Preferences */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-primary" />
                  <Label>Preferred Break Activity</Label>
                </div>
                <Select
                  value={preferences.breakStyle}
                  onValueChange={(value) => updatePreference('breakStyle', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk">Walking</SelectItem>
                    <SelectItem value="stretch">Stretching</SelectItem>
                    <SelectItem value="coffee">Coffee Break</SelectItem>
                    <SelectItem value="meditation">Meditation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="breakInterval">Break Every (minutes)</Label>
                <Select
                  value={preferences.breakInterval.toString()}
                  onValueChange={(value) => updatePreference('breakInterval', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Work Hours and Commute */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxWorkHours">Max Work Hours per Day</Label>
                <Select
                  value={preferences.maxWorkHours.toString()}
                  onValueChange={(value) => updatePreference('maxWorkHours', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="8">8 hours</SelectItem>
                    <SelectItem value="10">10 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Commute Mode</Label>
                <Select
                  value={preferences.commuteMode}
                  onValueChange={(value) => updatePreference('commuteMode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Work from Home</SelectItem>
                    <SelectItem value="walk">Walking</SelectItem>
                    <SelectItem value="bike">Cycling</SelectItem>
                    <SelectItem value="public">Public Transport</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={loading}
              variant="ai"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving Preferences...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Complete Setup
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
