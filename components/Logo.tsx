import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  compact?: boolean;
  variant?: "outline" | "solid";
}

export default function Logo({ size = 28, className = "", compact = false, variant = "outline" }: LogoProps) {
  const textSize = size >= 120 ? "text-5xl" : size >= 60 ? "text-2xl" : "text-base";
  const fillCircle = variant === "solid";
  const innerStroke = fillCircle ? "#0B1F3A" : "var(--theme-accent)";
  return (
    <div className={`flex items-center gap-2 ${className}`} style={{ color: 'var(--theme-accent)' }}>
      <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        {fillCircle ? (
          <>
            <circle cx="32" cy="32" r="28" fill="var(--theme-accent)" />
            <path d="M18 40 L28 24 L46 40" stroke={innerStroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M24 34 L44 34" stroke={innerStroke} strokeWidth="1.8" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="32" cy="32" r="28" stroke="var(--theme-accent)" strokeWidth="2" fill="none" />
            <path d="M18 40 L28 24 L46 40" stroke="var(--theme-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M24 34 L44 34" stroke="var(--theme-accent)" strokeWidth="1.8" strokeLinecap="round" />
          </>
        )}
      </svg>

      {!compact && <div className={`font-serif ${textSize} font-semibold`}>
        <span>Trip</span>
      </div>}
    </div>
  );
}
