import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import "./NotFound.css";



interface APODData {
  url: string;
  title: string;
  explanation: string;
  media_type: string;
  hdurl?: string;
  date: string;
}

const NotFound = () => {
  const location = useLocation();
  const [typed, setTyped] = useState("");
  const [apodData, setApodData] = useState<APODData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const message = "Whoops! You seem to be lost in space. This page doesn't exist in this universe.";

  // Fetch NASA APOD data directly from NASA API
  useEffect(() => {
    const fetchAPOD = async () => {
      try {
        // Use NASA API directly - check for environment variable or use DEMO_KEY
        const apiKey = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';
        const nasaApiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
        
        console.log('Fetching APOD directly from NASA API with key:', apiKey.substring(0, 4) + '...'); // Debug log
        
        const response = await fetch(nasaApiUrl);
        
        if (!response.ok) {
          throw new Error(`NASA API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('NASA APOD API Response:', data); // Debug log
        
        // If the current APOD is a video, try to get an image from recent days
        if (data.media_type !== 'image') {
          console.log('Current APOD is a video, trying to find a recent image...');
          
          // Try the last 7 days to find an image
          for (let i = 1; i <= 7; i++) {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - i);
            const dateString = pastDate.toISOString().split('T')[0];
            
            const fallbackUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${dateString}`;
            const fallbackResponse = await fetch(fallbackUrl);
            
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              if (fallbackData.media_type === 'image') {
                console.log(`Found image APOD from ${dateString}:`, fallbackData);
                setApodData(fallbackData);
                return;
              }
            }
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          // If no images found, use fallback but log it
          console.log('No image APOD found in recent days, using fallback background');
          setError(true);
        } else {
          console.log('APOD Data received in NotFound:', data); // Debug log
          setApodData(data);
        }
      } catch (err) {
        console.error('Error fetching APOD directly from NASA:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAPOD();
  }, []);

  // Debug log for APOD data state
  useEffect(() => {
    console.log('NotFound APOD State:', {
      isLoading,
      error,
      hasApodData: !!apodData,
      apodData: apodData ? {
        title: apodData.title,
        media_type: apodData.media_type,
        url: apodData.url,
        hdurl: apodData.hdurl,
        date: apodData.date
      } : null
    });
  }, [isLoading, error, apodData]);

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTyped(message.slice(0, i));
      i++;
      if (i > message.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="h-screen w-screen flex items-center justify-center relative overflow-hidden text-white space-bg fixed inset-0">
      {/* NASA APOD Background */}
      {!isLoading && apodData && !error && apodData.media_type === 'image' && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${apodData.hdurl || apodData.url})`,
            }}
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        </>
      )}
      
      {/* Fallback background if APOD fails or is loading or is video */}
      {(isLoading || error || !apodData || apodData.media_type !== 'image') && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        </div>
      )}

      {/* Animated stars background */}
      <div className="twinkling-stars" />

      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute top-4 right-4 z-20">
          <Loader2 className="w-6 h-6 loading-spinner text-white/70" />
        </div>
      )}

      <div className="relative z-10 text-center w-full max-w-2xl mx-auto px-4 flex flex-col justify-center items-center h-full fade-in-up min-h-0">
        {/* Glowing animated ring and bold glitchy 404 - Made Smaller */}
        <div className="relative flex justify-center items-center mb-4 sm:mb-6">
          <div className="absolute -inset-4 sm:-inset-6 z-0 rounded-full bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-blue-600/30 blur-lg animate-pulse" />
          <div className="relative z-10 text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[6rem] font-extrabold glowing-404 text-transparent bg-clip-text drop-shadow-[0_0_40px_rgba(99,102,241,0.7)]">
            404
          </div>
        </div>

        {/* Floating 404 GIF - Made Smaller */}
        <div className="flex justify-center mb-4 sm:mb-6 floating-astronaut flex-shrink-0">
          <div className="relative transform hover:scale-110 transition-transform duration-300">
            <img 
              src="./404.gif" 
              alt="404 Error Animation" 
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 object-contain"
            />
          </div>
        </div>

        {/* Glassmorphism Card - Made more compact and responsive */}
        <div className="glass-card bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 border border-white/20 w-full max-w-sm sm:max-w-md md:max-w-lg relative overflow-hidden fade-in-up flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-blue-600/5" />
          
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 via-blue-300 to-indigo-400 text-transparent bg-clip-text">
            Lost in Space
          </h1>
          
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-blue-100/80 mb-2 sm:mb-3 leading-relaxed">
            {typed}
            <span className="typewriter-cursor opacity-0">|</span>
          </p>

          {/* APOD Info - More compact */}
          {apodData && !error && apodData.media_type === 'image' && (
            <p className="text-xs text-blue-200/60 mb-4 sm:mb-6 italic">
              Background: {apodData.title} - NASA APOD ({apodData.date})
            </p>
          )}
          
          <Link
            to="/"
            className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-3 rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm md:text-base lg:text-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-700 hover:to-indigo-700 shadow-2xl transition-all duration-300 border border-blue-300/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-105 transform w-full"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">Return to Earth</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
