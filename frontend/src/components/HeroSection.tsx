import * as React from "react"
import { useSignIn, useSignUp, useUser } from "@clerk/clerk-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils"
import { ChevronRight, Brain, MessageSquare, Calendar, Mic, Volume2, Cloud, Bot, Sparkles, Kanban, Zap, Thermometer, Clock, Cpu, Terminal, Ellipsis, DollarSign, HeartHandshake, Share, HelpCircle, Settings, Heart } from "lucide-react"
import { useTimeOfDay } from "../hooks/useTimeOfDay";
import { Component as CursorFollower } from "./ui/cursor-follower";
import { SplineScene } from "./ui/spline";
import { Spotlight } from "./ui/spotlight";
import { useNavigate } from "react-router-dom";
import { SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import DayNightCycle from "./DayNightCycle";
import { memo, useEffect, useLayoutEffect, useMemo, useState } from "react"
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion"
import { easeInOut } from "framer-motion";

// Import hero images (uncomment and add your actual image imports)
// import dashboardOverview from "../assets/dashboard-overview.jpg"
// import aiPlanningInterface from "../assets/ai-planning-interface.jpg"
// import taskManagement from "../assets/task-management.jpg"
// import calendarIntegration from "../assets/calendar-integration.jpg"
// import analyticsDashboard from "../assets/analytics-dashboard.jpg"
// import smartRecommendations from "../assets/smart-recommendations.jpg"
// import progressTracking from "../assets/progress-tracking.jpg"
// import teamCollaboration from "../assets/team-collaboration.jpg"

// Media query hook
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

type UseMediaQueryOptions = {
  defaultValue?: boolean
  initializeWithValue?: boolean
}

const IS_SERVER = typeof window === "undefined"

export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptions = {}
): boolean {
  const getMatches = (query: string): boolean => {
    if (IS_SERVER) {
      return defaultValue
    }
    return window.matchMedia(query).matches
  }

  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) {
      return getMatches(query)
    }
    return defaultValue
  })

  const handleChange = () => {
    setMatches(getMatches(query))
  }

  useIsomorphicLayoutEffect(() => {
    const matchMedia = window.matchMedia(query)
    handleChange()

    matchMedia.addEventListener("change", handleChange)

    return () => {
      matchMedia.removeEventListener("change", handleChange)
    }
  }, [query])

  return matches
}

// Dashboard preview images
const dashboardImages = [
  "/hero/P1.png",
  "/hero/P2.png", 
  "/hero/P3.png",
  "/hero/P4.png",
  "/hero/P5.png",
  "/hero/P6.png",
  "/hero/P7.png",
]

const duration = 0.15
const transition = { duration, ease: easeInOut }
const transitionOverlay = { duration: 0.5, ease: easeInOut }

const DashboardCarousel = memo(
  ({
    handleClick,
    controls,
    cards,
    isCarouselActive,
  }: {
    handleClick: (imgUrl: string, index: number) => void
    controls: any
    cards: string[]
    isCarouselActive: boolean
  }) => {
    const isScreenSizeSm = useMediaQuery("(max-width: 640px)")
    const cylinderWidth = isScreenSizeSm ? 1100 : 1800
    const faceCount = cards.length
    const faceWidth = cylinderWidth / faceCount
    const radius = cylinderWidth / (2 * Math.PI)
    const rotation = useMotionValue(0)
    const transform = useTransform(
      rotation,
      (value) => `rotate3d(0, 1, 0, ${value}deg)`
    )

    return (
      <div
        className="flex h-full items-center justify-center"
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <motion.div
          drag={isCarouselActive ? "x" : false}
          className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing"
          style={{
            transform,
            rotateY: rotation,
            width: cylinderWidth,
            transformStyle: "preserve-3d",
          }}
          onDrag={(_, info) =>
            isCarouselActive &&
            rotation.set(rotation.get() + info.offset.x * 0.05)
          }
          onDragEnd={(_, info) =>
            isCarouselActive &&
            controls.start({
              rotateY: rotation.get() + info.velocity.x * 0.05,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 30,
                mass: 0.1,
              },
            })
          }
          animate={controls}
        >
          {cards.map((imgUrl, i) => (
            <motion.div
              key={`key-${imgUrl}-${i}`}
              className="absolute flex h-full origin-center items-center justify-center rounded-xl p-2"
              style={{
                width: `${faceWidth}px`,
                transform: `rotateY(${
                  i * (360 / faceCount)
                }deg) translateZ(${radius}px)`,
              }}
              onClick={() => handleClick(imgUrl, i)}
            >
              <motion.img
                src={imgUrl}
                alt={`Dashboard preview ${i + 1}`}
                layoutId={`img-${imgUrl}`}
                className="pointer-events-none w-full rounded-xl object-cover shadow-lg border border-border aspect-video"
                initial={{ filter: "blur(4px)" }}
                layout="position"
                animate={{ filter: "blur(0px)" }}
                transition={transition}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    )
  }
)

function ThreeDDashboardCarousel() {
  const [activeImg, setActiveImg] = useState<string | null>(null)
  const [isCarouselActive, setIsCarouselActive] = useState(true)
  const controls = useAnimation()
  const cards = useMemo(() => dashboardImages, [])

  const handleClick = (imgUrl: string) => {
    setActiveImg(imgUrl)
    setIsCarouselActive(false)
    controls.stop()
  }

  const handleClose = () => {
    setActiveImg(null)
    setIsCarouselActive(true)
  }

  return (
    <motion.div layout className="relative">
      <AnimatePresence mode="sync">
        {activeImg && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            layoutId={`img-container-${activeImg}`}
            layout="position"
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 m-5 md:m-36 lg:mx-[19rem] rounded-3xl cursor-pointer"
            style={{ willChange: "opacity" }}
            transition={transitionOverlay}
          >
            <motion.img
              layoutId={`img-${activeImg}`}
              src={activeImg}
              className="max-w-full max-h-full rounded-lg shadow-2xl border border-border"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              style={{
                willChange: "transform",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative h-[400px] w-full overflow-hidden rounded-lg">
        <DashboardCarousel
          handleClick={handleClick}
          controls={controls}
          cards={cards}
          isCarouselActive={isCarouselActive}
        />
      </div>
    </motion.div>
  )
}

const RetroGrid = ({
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lightLineColor = "hsl(var(--muted-foreground))",
  darkLineColor = "hsl(var(--muted-foreground))",
}) => {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--light-line": lightLineColor,
    "--dark-line": darkLineColor,
  } as React.CSSProperties

  return (
    <div
      className={cn(
        "pointer-events-none absolute size-full overflow-hidden [perspective:200px]",
        `opacity-[var(--opacity)]`,
      )}
      style={gridStyles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent to-90%" />
    </div>
  )
}

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "Smart AI Planning",
      description:
        "Our AI analyzes your priorities and schedule to create the perfect daily plan.",
      icon: <Brain className="h-6 w-6" />,
    },
    {
      title: "NASA APOD Integration",
      description:
        "Get inspired daily with NASA's Astronomy Picture of the Day integrated into your planner.",
      icon: <Sparkles className="h-6 w-6" />,
    },
    {
      title: "Task Management",
      description:
        "Organize, prioritize, and track your tasks with intelligent sorting.",
      icon: <Kanban className="h-6 w-6" />,
    },
    {
      title: "Voice Assistant",
      description: 
        "Add tasks and get schedule updates using natural voice commands.",
      icon: <Mic className="h-6 w-6" />,
    },
    {
      title: "Performance Insights",
      description:
        "Track productivity patterns and get personalized recommendations.",
      icon: <Zap className="h-6 w-6" />,
    },
    {
      title: "Weather Integration",
      description:
        "Plan your day with real-time weather forecasts and smart recommendations.",
      icon: <Cloud className="h-6 w-6" />,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 h-full">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col p-4 relative group/feature border border-neutral-200 dark:border-neutral-800 rounded-lg hover:shadow-md transition-all duration-200"
      )}
    >
      <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-tr from-neutral-100/80 dark:from-neutral-800/80 to-transparent rounded-lg pointer-events-none" />
      <div className="mb-3 relative z-10 text-primary dark:text-primary">
        {icon}
      </div>
      <div className="text-base font-bold mb-2 relative z-10 flex items-center">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-primary/40 dark:bg-primary/60 group-hover/feature:bg-primary transition-all duration-200 origin-center -ml-4 opacity-0 group-hover/feature:opacity-100" />
        <span className="group-hover/feature:translate-x-1 transition duration-200 inline-block text-foreground">
          {title}
        </span>
      </div>
      <p className="text-xs text-muted-foreground relative z-10">
        {description}
      </p>
    </div>
  );
};

export const HeroSection = () => {
  const { timeInfo } = useTimeOfDay();
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isSignedIn) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative">
      <CursorFollower />
      <div className="absolute top-0 z-[0] h-screen w-screen bg-primary/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,hsl(var(--primary)/0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,hsl(var(--primary)/0.3),rgba(255,255,255,0))]" />
      {/* Day/Night Cycle background animation - positioned even higher */}
      <div className="absolute inset-0 transform translate-y-[-15%]">
        <DayNightCycle />
      </div>
      <section className="relative max-w-full mx-auto z-1">
        <RetroGrid 
          angle={65}
          opacity={0.4}
          cellSize={50}
          lightLineColor="hsl(var(--border))"
          darkLineColor="hsl(var(--border))"
        />
        <div className="max-w-screen-xl z-10 mx-auto px-4 py-28 gap-12 md:px-8">
          <div className="space-y-5 max-w-3xl leading-0 lg:leading-5 mx-auto text-center">
            <h1 className="text-sm text-muted-foreground group font-medium mx-auto px-5 py-2 bg-gradient-to-tr from-muted/20 via-muted/20 to-transparent border-[2px] border-border/50 rounded-3xl w-fit">
              {timeInfo.greeting}
              <ChevronRight className="inline w-4 h-4 ml-2 group-hover:translate-x-1 duration-300" />
            </h1>
            <h2 className="text-4xl tracking-tighter font-bold bg-clip-text text-transparent mx-auto md:text-6xl bg-gradient-to-b from-foreground to-muted-foreground">
              Transform your ideas into{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-glow">
                intelligent daily plans
              </span>
            </h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">
              Let our AI agents analyze your tasks, priorities, and schedule to create the perfect day plan. 
              Boost productivity and reduce stress with intelligent automation.
            </p>
            <div className="items-center justify-center gap-x-3 space-y-3 sm:flex sm:space-y-0">
              {isSignedIn ? (
                <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,hsl(var(--primary))_0%,hsl(var(--primary-glow))_50%,hsl(var(--primary))_100%)]" />
                  <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-background text-xs font-medium backdrop-blur-3xl">
                    <button
                      onClick={handleGetStarted}
                      className="inline-flex rounded-full text-center group items-center w-full justify-center bg-gradient-to-tr from-muted/20 via-primary/30 to-transparent text-foreground border-input border-[1px] hover:bg-gradient-to-tr hover:from-muted/30 hover:via-primary/40 hover:to-transparent transition-all sm:w-auto py-4 px-10"
                    >
                      <Brain className="mr-2 h-4 w-4" />
                      Go to Dashboard
                    </button>
                  </div>
                </span>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <SignUpButton mode="modal">
                    <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
                      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,hsl(var(--primary))_0%,hsl(var(--primary-glow))_50%,hsl(var(--primary))_100%]" />
                      <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-background text-xs font-medium backdrop-blur-3xl">
                        <button className="inline-flex rounded-full text-center group items-center w-full justify-center bg-gradient-to-tr from-muted/20 via-primary/30 to-transparent text-foreground border-input border-[1px] hover:bg-gradient-to-tr hover:from-muted/30 hover:via-primary/40 hover:to-transparent transition-all sm:w-auto py-4 px-10">
                          <Brain className="mr-2 h-4 w-4" />
                          Start Planning Today
                        </button>
                      </div>
                    </span>
                  </SignUpButton>
                  
                  <SignInButton mode="modal">
                    <Button variant="outline" size="lg">
                      Sign In
                    </Button>
                  </SignInButton>
                </div>
              )}
            </div>
          </div>
          <div className="mt-32 mx-10 relative z-10 space-y-8">
            {/* 3D Dashboard Carousel */}
            <div className="w-full">
              <ThreeDDashboardCarousel />
            </div>
            
            {/* AI Bot 3D Animation and Features Section */}
            <div className="mt-12">
              <div className="flex flex-col lg:flex-row gap-8 items-stretch justify-between">
                {/* AI Bot 3D Animation Section - Made larger */}
                <div className="flex-1 relative">
                  {/* 3D Bot Animation Container - Increased height */}
                  <div className="w-full h-[500px] bg-gradient-to-br from-black/30 to-primary/20 rounded-xl overflow-hidden border border-border">
                    <SplineScene 
                      scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                      className="w-full h-full"
                    />
                  </div>
                </div>

                {/* Features Section - Now on the right of the bot video */}
                <div className="flex-1">
                  <FeaturesSectionWithHoverEffects />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
