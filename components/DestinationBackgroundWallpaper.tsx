"use client";

import { ReactNode } from "react";

interface DestinationBackgroundWallpaperProps {
  destination?: string;
  children?: ReactNode;
  className?: string;
}

export default function DestinationBackgroundWallpaper({
  destination,
  children,
  className = "",
}: DestinationBackgroundWallpaperProps) {
  return (
    <div
      className={`relative w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${className}`}
      style={{
        backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(15,23,42,0.5)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,128C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>')`,
        backgroundAttachment: "fixed",
      }}
    >
      {children}
    </div>
  );
}
