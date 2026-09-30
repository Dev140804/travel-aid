"use client";

import { useMemo, useState, useEffect } from "react";
import { FaCarSide, FaBus, FaPlane, FaTrain, FaPersonWalking, FaMapLocationDot, FaLink } from "react-icons/fa6";

type TransitInfoCardProps = {
  sourceName: string;
  destName: string;
  source?: { lat: number; lng: number } | null;
  destination?: { lat: number; lng: number } | null;
  transitMode: string;
  budget: string;
  destinationCity: string;
  sourceIndex?: number;
  destIndex?: number;
  themeColor?: string;
  startTime?: string; // Time when leaving source activity (e.g., "14:30")
  endTime?: string; // Time when arriving at destination activity (calculated)
};

export default function TransitInfoCard({
  sourceName,
  destName,
  source,
  destination,
  transitMode,
  budget,
  destinationCity,
  sourceIndex = 0,
  destIndex = 0,
  themeColor = "#D4AF37",
  startTime,
  endTime: providedEndTime,
}: TransitInfoCardProps) {
  const [apiDistance, setApiDistance] = useState<string | null>(null);
  const [apiTime, setApiTime] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper function to convert 24-hour format to 12-hour format
  const convertTo12Hour = (time24: string): string => {
    if (!time24) return "--:--";
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Helper function to calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, durationSeconds: number): string => {
    if (!startTime || !durationSeconds) return "--:--";
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + Math.round(durationSeconds / 60);
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
  };

  // Fetch real distance and time from Google Maps Distance Matrix API
  useEffect(() => {
    if (!source || !destination) return;

    setLoading(true);
    const fetchTravelData = async () => {
      try {
        const params = new URLSearchParams({
          sourceLat: source.lat.toString(),
          sourceLng: source.lng.toString(),
          destLat: destination.lat.toString(),
          destLng: destination.lng.toString(),
          mode: transitMode,
        });

        const response = await fetch(`/api/travel-distance?${params}`);
        const data = await response.json();

        if (data.distance && data.time) {
          setApiDistance(data.distance);
          setApiTime(data.time);
          setDurationSeconds(data.durationSeconds);
        }
      } catch (error) {
        console.error("Error fetching travel distance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTravelData();
  }, [source, destination, transitMode]);

  // Use Google Maps distance and time if available
  const distance = apiDistance || (loading ? "–" : null);
  const displayTime = apiTime || (loading ? "–" : "–");

  // Calculate the arrival time
  const calculatedEndTime = useMemo(() => {
    if (providedEndTime) return providedEndTime;
    if (!startTime || !durationSeconds) return null;
    return calculateEndTime(startTime, durationSeconds);
  }, [startTime, durationSeconds, providedEndTime]);

  // Format times to 12-hour display
  const displayStartTime = startTime ? convertTo12Hour(startTime) : null;
  const displayEndTime = calculatedEndTime ? convertTo12Hour(calculatedEndTime) : null;

  const getTransitIcon = () => {
    // All transit icons should use the theme accent color for consistency
    switch (transitMode.toLowerCase()) {
      case "flight":
        return <FaPlane className="w-5 h-5 theme-accent" />;
      case "train":
        return <FaTrain className="w-5 h-5 theme-accent" />;
      case "bus":
        return <FaBus className="w-5 h-5 theme-accent" />;
      case "car":
      case "personal":
        return <FaCarSide className="w-5 h-5 theme-accent" />;
      case "walk":
        return <FaPersonWalking className="w-5 h-5 theme-accent" />;
      default:
        return <FaCarSide className="w-5 h-5 theme-accent" />;
    }
  };

  const getTransitLabel = () => {
    switch (transitMode.toLowerCase()) {
      case "flight":
        return "Flight";
      case "train":
        return "Train";
      case "bus":
        return "Bus";
      case "car":
        return "Car";
      case "personal":
        return "Personal Vehicle";
      case "walk":
        return "Walking";
      default:
        return transitMode;
    }
  };

  const getMapsMode = () => {
    const mode = transitMode.toLowerCase();
    if (mode === "walk") return "walking";
    if (mode === "car" || mode === "personal") return "driving";
    if (mode === "bus") return "transit";
    if (mode === "train") return "transit";
    if (mode === "flight") return "driving"; // Drive to nearest location
    return "driving";
  };

  return (
    <div className="my-4 p-4 rounded-2xl border backdrop-blur-sm shadow-md" style={{ borderColor: themeColor + "40", backgroundColor: "rgba(15, 23, 42, 0.8)" }}>
      {/* Header with "TRANSIT MODE" label */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: themeColor }}>Transit Route</span>
      </div>

      {/* Activity Route: Activity X → Activity Y */}
      <div className="mb-4 grid grid-cols-3 gap-3 items-center">
        {/* Source Activity */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold" style={{ backgroundColor: themeColor + "30", borderColor: themeColor, borderWidth: "2px", color: themeColor }}>
            {sourceIndex}
          </div>
          <div className="text-xs text-slate-400 mt-2 truncate">{sourceName.substring(0, 15)}</div>
          {displayStartTime && <div className="text-xs font-semibold mt-1" style={{ color: themeColor }}>{displayStartTime}</div>}
        </div>

        {/* Arrow and Transit Mode Icon */}
        <div className="flex flex-col items-center gap-2">
          <div style={{ color: themeColor }} className="text-xl font-bold">→</div>
          <div style={{ color: themeColor }} className="text-2xl">
            {getTransitIcon()}
          </div>
        </div>

        {/* Destination Activity */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold" style={{ backgroundColor: themeColor + "30", borderColor: themeColor, borderWidth: "2px", color: themeColor }}>
            {destIndex}
          </div>
          <div className="text-xs text-slate-400 mt-2 truncate">{destName.substring(0, 15)}</div>
          {displayEndTime && <div className="text-xs font-semibold mt-1" style={{ color: themeColor }}>{displayEndTime}</div>}
        </div>
      </div>

      {/* Distance, Time, and Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <div className="rounded-lg p-2 text-center border" style={{ backgroundColor: themeColor + "15", borderColor: themeColor + "40" }}>
          <div className="text-xs text-slate-400">Distance</div>
          <div className="text-sm font-bold" style={{ color: themeColor }}>{distance ? `${distance} mi` : "–"}</div>
        </div>
        <div className="rounded-lg p-2 text-center border" style={{ backgroundColor: themeColor + "15", borderColor: themeColor + "40" }}>
          <div className="text-xs text-slate-400">Time</div>
          <div className="text-sm font-bold" style={{ color: themeColor }}>{displayTime}</div>
        </div>
        <div className="rounded-lg p-2 text-center border" style={{ backgroundColor: themeColor + "15", borderColor: themeColor + "40" }}>
          <div className="text-xs text-slate-400">Mode</div>
          <div className="text-sm font-bold" style={{ color: themeColor }}>{getTransitLabel()}</div>
        </div>
        <div className="rounded-lg p-2 text-center border" style={{ backgroundColor: themeColor + "15", borderColor: themeColor + "40" }}>
          <div className="text-xs text-slate-400">Budget</div>
          <div className="text-sm font-bold" style={{ color: themeColor }}>{budget}</div>
        </div>
      </div>

      {/* Google Maps Navigation Link */}
      {source && destination && (
        <div className="flex items-center gap-2">
          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${source.lat},${source.lng}&destination=${destination.lat},${destination.lng}&travelmode=${getMapsMode()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: themeColor }}
          >
            <FaLink className="w-3 h-3 theme-accent" />
            Open in Google Maps
          </a>
        </div>
      )}
    </div>
  );
}
