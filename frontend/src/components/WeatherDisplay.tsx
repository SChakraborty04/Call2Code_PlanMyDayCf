import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, useApiAuth } from '../lib/api';
import { Cloud, MapPin, Thermometer, Droplets, Wind, Calendar, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const WEATHER_CACHE_KEY = 'planmyday_weather_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const WeatherDisplay = () => {
  const { isReady: apiReady } = useApiAuth();
  const [showForecast, setShowForecast] = useState(false);
  const [cachedData, setCachedData] = useState(null);
  const queryClient = useQueryClient();

  // Check for cached data on component mount
  useEffect(() => {
    const cached = localStorage.getItem(WEATHER_CACHE_KEY);
    if (cached) {
      try {
        const parsedCache = JSON.parse(cached);
        const isExpired = new Date().getTime() - parsedCache.timestamp > CACHE_DURATION;
        
        if (!isExpired && parsedCache.data) {
          setCachedData(parsedCache.data);
        } else {
          localStorage.removeItem(WEATHER_CACHE_KEY);
        }
      } catch (error) {
        localStorage.removeItem(WEATHER_CACHE_KEY);
      }
    }
  }, []);

  const { data: weatherData, isLoading, error } = useQuery({
    queryKey: ['weather'],
    queryFn: apiClient.getWeather,
    enabled: apiReady && !cachedData, // Only fetch if no valid cache
    staleTime: CACHE_DURATION,
    refetchInterval: false, // Disable automatic refetch
  });

  // Handle successful data fetch
  useEffect(() => {
    if (weatherData && !cachedData) {
      // Cache the data
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
        data: weatherData,
        timestamp: new Date().getTime()
      }));
      setCachedData(weatherData);
    }
  }, [weatherData, cachedData]);

  const refreshWeatherMutation = useMutation({
    mutationFn: async () => {
      // Clear cache and fetch fresh data
      localStorage.removeItem(WEATHER_CACHE_KEY);
      return apiClient.getWeather();
    },
    onSuccess: (data) => {
      // Update cache
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
        data: data,
        timestamp: new Date().getTime()
      }));
      setCachedData(data);
      queryClient.setQueryData(['weather'], data);
      toast.success('Weather data refreshed!');
    },
    onError: (error: any) => {
      toast.error('Failed to refresh weather: ' + error.message);
    },
  });

  const currentWeatherData = cachedData || weatherData;

  if (isLoading && !cachedData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error && !cachedData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Cloud className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Unable to load weather data
          </p>
          <Button 
            onClick={() => refreshWeatherMutation.mutate()} 
            disabled={refreshWeatherMutation.isPending}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshWeatherMutation.isPending ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-primary" />
              Current Weather
              {cachedData && (
                <Badge variant="outline" className="text-xs">
                  Cached
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {currentWeatherData?.current?.location}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowForecast(!showForecast)}
              className="flex items-center gap-2"
            >
              {showForecast ? <Clock className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
              {showForecast ? 'Today' : 'Forecast'}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => refreshWeatherMutation.mutate()}
              disabled={refreshWeatherMutation.isPending}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${refreshWeatherMutation.isPending ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showForecast ? (
          // Current Weather
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-orange-500" />
                  <span className="text-2xl font-bold">{currentWeatherData?.current?.temperature}</span>
                </div>
              </div>
              
              {currentWeatherData?.current?.icon && (
                <img
                  src={`https://openweathermap.org/img/wn/${currentWeatherData.current.icon}@2x.png`}
                  alt={currentWeatherData.current.condition}
                  className="w-16 h-16"
                />
              )}
            </div>

            <div>
              <Badge variant="outline" className="text-sm capitalize">
                {currentWeatherData?.current?.condition}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span>Humidity: {currentWeatherData?.current?.humidity}%</span>
              </div>
              
              {currentWeatherData?.current?.windSpeed && (
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-gray-500" />
                  <span>Wind: {currentWeatherData.current.windSpeed} m/s</span>
                </div>
              )}
            </div>
          </>
        ) : (
          // Forecast View
          <div className="space-y-4">
            {/* Today's Hourly Forecast */}
            {currentWeatherData?.todaysForecast && currentWeatherData.todaysForecast.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Today's Forecast
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {currentWeatherData.todaysForecast.slice(0, 4).map((forecast: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div>
                        <div className="text-sm font-medium">{forecast.time}</div>
                        <div className="text-xs text-muted-foreground capitalize">{forecast.condition}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://openweathermap.org/img/wn/${forecast.icon}.png`}
                          alt={forecast.condition}
                          className="w-8 h-8"
                        />
                        <span className="font-medium">{forecast.temperature}°C</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5-Day Forecast */}
            {currentWeatherData?.dailyForecast && currentWeatherData.dailyForecast.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  5-Day Forecast
                </h4>
                <div className="space-y-2">
                  {currentWeatherData.dailyForecast.map((day: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div>
                        <div className="text-sm font-medium">{day.date}</div>
                        <div className="text-xs text-muted-foreground capitalize">{day.condition}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                          alt={day.condition}
                          className="w-8 h-8"
                        />
                        <div className="text-sm">
                          <span className="font-medium">{day.temperature.high}°</span>
                          <span className="text-muted-foreground">/{day.temperature.low}°</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {cachedData && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Cached data - click refresh for latest updates
          </div>
        )}
      </CardContent>
    </Card>
  );
};
