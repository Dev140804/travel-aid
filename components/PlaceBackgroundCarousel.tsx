"use client";

import { useEffect, useState } from "react";

interface PlaceBackgroundCarouselProps {
  images: string[];
  placeName: string;
}

export default function PlaceBackgroundCarousel({
  images,
  placeName,
}: PlaceBackgroundCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Cycle through images every 8 seconds
  useEffect(() => {
    if (!images || images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [images]);

  const currentImage = images && images.length > 0 ? images[currentImageIndex] : null;

  // Fallback image if none available
  const displayImage = currentImage || `https://source.unsplash.com/1920x1080/?${encodeURIComponent(placeName)},travel`;

  return (
    <div 
      className="fixed inset-0 z-0 overflow-hidden"
      style={{
        backgroundImage: `url('${displayImage}')`,
        backgroundSize: '120%',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        transition: 'background-image 1.5s ease-in-out, background-size 12s ease-in-out infinite',
        animation: 'zoom-bg 12s ease-in-out infinite',
      }}
    >
      {/* Blur effect layer */}
      <div className="absolute inset-0 backdrop-blur-sm" />
      
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1F3A]/30 via-[#0B1F3A]/35 to-[#0B1F3A]/40" />
    </div>
  );
}
