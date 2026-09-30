import React from 'react';

const common = {
  width: 20,
  height: 20,
  // Use stroke-based outline icons that inherit the current text color.
  stroke: 'currentColor',
  strokeWidth: 1.75,
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
} as React.SVGProps<SVGSVGElement>;

export const IconTag = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...common} viewBox="0 0 24 24" {...props}>
    <path d="M20.59 13.41L12 4.83a2 2 0 00-1.41-.59H4a2 2 0 00-2 2v6.59a2 2 0 00.59 1.41l8.59 8.59a2 2 0 002.83 0l6.58-6.58a2 2 0 000-2.82z" />
    <circle cx="7.5" cy="7.5" r="1" />
  </svg>
);

export const IconWrench = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...common} viewBox="0 0 24 24" {...props}>
    <path d="M21 2l-2 2a6 6 0 00-8.49 8.49L2 21l3 3 8.51-8.51A6 6 0 0019 7l2-2-0-3z" />
  </svg>
);

export const IconSettings = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...common} viewBox="0 0 24 24" {...props}>
    <path d="M12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7z" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09c.7 0 1.3-.41 1.51-1a1.65 1.65 0 00-.33-1.82L4.31 4.7A2 2 0 017.14 1.88l.06.06c.5.5 1.18.78 1.9.78.39 0 .77-.09 1.11-.26C11 2.22 11.49 2 12 2s1 .22 1.79.46c.34.17.72.26 1.11.26.72 0 1.4-.28 1.9-.78l.06-.06A2 2 0 0119.69 4.7l-.06.06c-.5.5-.78 1.18-.78 1.9 0 .39.09.77.26 1.11.24.79.46 1.29.46 1.79s-.22 1-.46 1.79c-.17.34-.26.72-.26 1.11z" />
  </svg>
);

export const IconCalendar = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...common} viewBox="0 0 24 24" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

export const IconTool = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...common} viewBox="0 0 24 24" {...props}>
    <path d="M22 2l-6 6" />
    <path d="M20.49 7.51a6 6 0 11-8.49 8.49L3 23l-1-1 6.99-8.99A6 6 0 1120.49 7.51z" />
  </svg>
);

export const IconCar = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...common} viewBox="0 0 24 24" {...props}>
    <path d="M3 13l1.5-4.5A2 2 0 016.5 7h11a2 2 0 011.99 1.5L21 13" />
    <path d="M5 13v5a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-5" />
    <path d="M7 7v-2M17 7v-2" />
  </svg>
);

export const IconBus = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...common} viewBox="0 0 24 24" {...props}>
    <rect x="2" y="6" width="20" height="10" rx="2" ry="2" />
    <path d="M6 16v2M18 16v2" />
  </svg>
);

export const IconTaxi = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...common} viewBox="0 0 24 24" {...props}>
    <path d="M3 13l1.5-4.5A2 2 0 016.5 7h11A2 2 0 0119 8.5L20.5 13" />
    <path d="M5 13v5a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-5" />
    <path d="M7 7v-2M17 7v-2" />
  </svg>
);

export const IconMotorcycle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...common} viewBox="0 0 24 24" {...props}>
    <path d="M3 13h2l3-6h6l2 4" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
);

export const IconFuel = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...common} viewBox="0 0 24 24" {...props}>
    <path d="M7 2h6v6H7z" />
    <path d="M7 8v11a2 2 0 002 2h6a2 2 0 002-2V8" />
    <path d="M20 7v6" />
    <path d="M20 7h-2" />
  </svg>
);

export const IconGauge = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...common} viewBox="0 0 24 24" {...props}>
    <path d="M3 12a9 9 0 1118 0" />
    <path d="M12 12l4-4" />
  </svg>
);

export const IconPin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...common} viewBox="0 0 24 24" {...props}>
    <path d="M12 21s-6-4.35-6-10a6 6 0 1112 0c0 5.65-6 10-6 10z" />
    <circle cx="12" cy="11" r="2" />
  </svg>
);

export const IconMoney = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...common} viewBox="0 0 24 24" {...props}>
    <rect x="2" y="6" width="20" height="14" rx="2" ry="2" />
    <path d="M16 11.5a2.5 2.5 0 01-5 0" />
    <path d="M12 7v1" />
    <path d="M12 16v1" />
  </svg>
);

export const IconHome = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...common} viewBox="0 0 24 24" {...props}>
    <path d="M3 11.5L12 4l9 7.5" />
    <path d="M9 21V12h6v9" />
  </svg>
);

export default null;
