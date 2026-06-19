"use client";

import { useState, useEffect, useRef } from "react";

export default function AnimatedHeroBackground() {
  const [currentScene, setCurrentScene] = useState(0);
  const [nextScene, setNextScene] = useState(1);
  const [videoError, setVideoError] = useState(false);
  const [shuffledVideos, setShuffledVideos] = useState<typeof travelScenes>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Your uploaded videos with titles and descriptions
  const travelScenes = [
    {
      id: "video1",
      name: "Scenic Escape",
      location: "Nature's Beauty",
      description: "Immersive travel destination",
      videoUrl: "/videos/12489082_2160_3840_60fps.mp4",
      quality: "4K Ultra",
    },
    {
      id: "video2",
      name: "Adventure",
      location: "Explore More",
      description: "Breathtaking landscapes",
      videoUrl: "/videos/14332485_1440_2560_32fps.mp4",
      quality: "2K",
    },
    {
      id: "video3",
      name: "Wanderlust",
      location: "Dream Destination",
      description: "Stunning vistas",
      videoUrl: "/videos/14435265_1080_1920_30fps.mp4",
      quality: "HD",
    },
    {
      id: "video4",
      name: "Paradise",
      location: "Tropical Vibes",
      description: "Pure relaxation",
      videoUrl: "/videos/14545373_2160_3840_60fps.mp4",
      quality: "4K Ultra",
    },
    {
      id: "video5",
      name: "Horizons",
      location: "Endless Views",
      description: "Visual masterpiece",
      videoUrl: "/videos/14551182_1080_1920_24fps.mp4",
      quality: "HD",
    },
    {
      id: "video6",
      name: "Discovery",
      location: "New Frontiers",
      description: "Inspiring moments",
      videoUrl: "/videos/14960101_2160_3840_30fps.mp4",
      quality: "4K Ultra",
    },
    {
      id: "video7",
      name: "Serenity",
      location: "Peaceful Spaces",
      description: "Calming experience",
      videoUrl: "/videos/14968213_2160_3840_60fps.mp4",
      quality: "4K Ultra",
    },
    {
      id: "video8",
      name: "Essence",
      location: "Pure Beauty",
      description: "Unforgettable journey",
      videoUrl: "/videos/5508460-hd_1080_1920_30fps.mp4",
      quality: "HD",
    },
    {
      id: "video9",
      name: "Expedition",
      location: "Global Wonder",
      description: "Premium experience",
      videoUrl: "/videos/6145259-hd_1080_1920_30fps.mp4",
      quality: "HD",
    },
  ];

  // Shuffle array function
  const shuffleArray = (array: typeof travelScenes) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Initialize shuffled videos on mount
  useEffect(() => {
    setShuffledVideos(shuffleArray(travelScenes));
  }, []);

  // Auto rotate scenes every 12 seconds with shuffled videos
  useEffect(() => {
    if (shuffledVideos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % shuffledVideos.length);
      setNextScene((prev) => (prev + 1) % shuffledVideos.length);
    }, 12000);

    return () => clearInterval(interval);
  }, [shuffledVideos.length]);

  // Set slow motion playback rate (0.5x = half speed)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5; // Slow motion
    }
  }, [currentScene]);

  const scene = shuffledVideos[currentScene];

  // Don't render until videos are shuffled
  if (shuffledVideos.length === 0) {
    return <div className="fixed inset-0 w-full h-screen bg-black" />;
  }

  return (
    <div className="fixed inset-0 w-full h-screen overflow-hidden bg-black">
      {/* CSS Animation for Subtle Continuous Zoom */}
      <style>{`
        @keyframes subtleZoom {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
          }
        }
        .subtle-zoom {
          animation: subtleZoom 20s ease-in-out infinite;
        }
      `}</style>

      {/* Video Background with Smooth Transition */}
      <div className="absolute inset-0 bg-black">
        {!videoError ? (
          <>
            {/* Main Video - Blurred Background with Subtle Zoom */}
            <video
              ref={videoRef}
              key={`video-${currentScene}`}
              autoPlay
              muted
              playsInline
              loop
              preload="auto"
              crossOrigin="anonymous"
              className="subtle-zoom w-full h-full object-cover"
              style={{
                opacity: 1,
                filter: "blur(8px)",
                transformOrigin: "center",
              }}
              onError={() => {
                console.error(`❌ Video failed: ${scene.name}`);
                setVideoError(true);
              }}
              onLoadStart={() => {
                console.log(`⏳ Loading (Slow Motion): ${scene.name}`);
              }}
              onCanPlay={() => {
                console.log(`▶️ Playing at 0.5x speed: ${scene.name}`);
              }}
              onLoadedMetadata={() => {
                console.log(`📊 Metadata loaded for: ${scene.name}`);
              }}
            >
              <source src={scene.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Dark Smooth Gradient Overlay for Text Visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
          </>
        ) : (
          // Fallback animated gradient background
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-950">
            <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/20 rounded-full filter blur-3xl animate-pulse"></div>
              <div
                className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/20 rounded-full filter blur-3xl animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute top-1/2 right-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl animate-pulse"
                style={{ animationDelay: "2s" }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Video Background complete */}
    </div>
  );
}
