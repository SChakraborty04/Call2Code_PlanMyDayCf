import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, useApiAuth } from '../lib/api';
import { ExternalLink, Calendar, Image, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const APOD_CACHE_KEY = 'planmyday_apod_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const ApodDisplay = () => {
  const { isReady: apiReady } = useApiAuth();
  const [cachedData, setCachedData] = useState(null);
  const queryClient = useQueryClient();

  // Check for cached data on component mount
  useEffect(() => {
    const cached = localStorage.getItem(APOD_CACHE_KEY);
    if (cached) {
      try {
        const parsedCache = JSON.parse(cached);
        const isExpired = new Date().getTime() - parsedCache.timestamp > CACHE_DURATION;
        
        if (!isExpired && parsedCache.data) {
          setCachedData(parsedCache.data);
        } else {
          localStorage.removeItem(APOD_CACHE_KEY);
        }
      } catch (error) {
        localStorage.removeItem(APOD_CACHE_KEY);
      }
    }
  }, []);

  const { data: apodResponse, isLoading, error } = useQuery({
    queryKey: ['apod'],
    queryFn: () => apiClient.getApod(),
    enabled: apiReady && !cachedData,
    staleTime: CACHE_DURATION,
    refetchInterval: false,
  });

  const apodData = apodResponse?.data;

  useEffect(() => {
    if (apodData && !cachedData) {
      console.log('APOD Data received:', apodData);
      localStorage.setItem(APOD_CACHE_KEY, JSON.stringify({
        data: apodData,
        timestamp: new Date().getTime()
      }));
      setCachedData(apodData);
    }
  }, [apodData, cachedData]);

  const refreshApodMutation = useMutation({
    mutationFn: async () => {
      localStorage.removeItem(APOD_CACHE_KEY);
      const response = await apiClient.getApod();
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem(APOD_CACHE_KEY, JSON.stringify({
        data: data,
        timestamp: new Date().getTime()
      }));
      setCachedData(data);
      queryClient.setQueryData(['apod'], { data });
      toast.success('NASA APOD refreshed!');
    },
    onError: (error: any) => {
      toast.error('Failed to refresh APOD: ' + error.message);
    },
  });

  const currentApodData = cachedData || apodData;
  
  useEffect(() => {
    if (currentApodData) {
      console.log('Current APOD Data:', {
        title: currentApodData.title,
        media_type: currentApodData.media_type,
        url: currentApodData.url,
        hdurl: currentApodData.hdurl,
        hasImage: !!(currentApodData.url || currentApodData.hdurl)
      });
    }
  }, [currentApodData]);

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
          <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Unable to load NASA Astronomy Picture of the Day
          </p>
          <Button 
            onClick={() => refreshApodMutation.mutate()} 
            disabled={refreshApodMutation.isPending}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshApodMutation.isPending ? 'animate-spin' : ''}`} />
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
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              NASA Astronomy Picture of the Day
              {cachedData && (
                <Badge variant="outline" className="text-xs">
                  Cached
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {currentApodData?.date}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refreshApodMutation.mutate()}
            disabled={refreshApodMutation.isPending}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${refreshApodMutation.isPending ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold">{currentApodData?.title}</h3>
        
        {currentApodData?.media_type === 'image' && currentApodData?.url && (
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <img
              src={currentApodData.hdurl || currentApodData.url}
              alt={currentApodData.title}
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {currentApodData?.media_type === 'video' && currentApodData?.url && (
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <iframe
              src={currentApodData.url}
              title={currentApodData.title}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        )}

        <p className="text-sm text-muted-foreground leading-relaxed">
          {currentApodData?.explanation}
        </p>

        <div className="flex items-center justify-between">
          <Badge variant="outline">
            {currentApodData?.media_type === 'image' ? 'Image' : 'Video'}
          </Badge>
          
          {currentApodData?.url && (
            <a
              href={currentApodData.hdurl || currentApodData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View Full Size
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {cachedData && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Cached data - click refresh for latest updates
          </div>
        )}
      </CardContent>
    </Card>
  );
};
