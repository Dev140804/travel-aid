"use client";

import { useState, useEffect, useRef } from "react";
import { travelFacts as defaultFacts } from "../lib/travelFacts";

export default function LoadingOverlay({ isOpen, destination }: { isOpen: boolean; destination?: string }) {
  const [factIndex, setFactIndex] = useState(0);
  const [currentFacts, setCurrentFacts] = useState<string[]>(defaultFacts);
  const [isFetchingCustom, setIsFetchingCustom] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when overlay closes
      fetchedRef.current = false;
      setCurrentFacts(defaultFacts);
      setIsFetchingCustom(false);
      return;
    }

    if (isOpen && destination && !fetchedRef.current) {
      fetchedRef.current = true;
      setIsFetchingCustom(true);
      
      fetch("/api/destination-facts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination })
      })
        .then(res => res.json())
        .then(data => {
          if (data.facts && data.facts.length > 0) {
            // Give preference to new localized facts by placing them at the beginning
            setCurrentFacts(prev => [...data.facts, ...prev]);
            setFactIndex(0); // Instantly swap to a fresh localized fact
          }
        })
        .catch(err => console.error("Fact fetch error:", err))
        .finally(() => setIsFetchingCustom(false));
    }
  }, [isOpen, destination]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen) {
      if (currentFacts === defaultFacts && factIndex === 0) {
        // Pick a random starting point only for the generic list
        setFactIndex(Math.floor(Math.random() * currentFacts.length));
      }
      
      // Rotate every 3.5 seconds
      interval = setInterval(() => {
        setFactIndex((prev) => (prev + 1) % currentFacts.length);
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, currentFacts.length]); // depend on length so it restarts smoothly

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-300">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300 outline outline-1 outline-zinc-200 dark:outline-zinc-800">
        
        {/* Animated Spinner Icon */}
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-r-4 border-emerald-500 animate-spin animation-delay-150"></div>
          <div className="absolute inset-4 rounded-full border-b-4 border-violet-500 animate-spin animation-delay-300"></div>
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            ✈️
          </div>
        </div>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Planning your trip {destination ? `to ${destination}` : ""}...
        </h2>
        
        <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm">
          Our AI is doing the heavy lifting. Hang tight, magic is happening!
        </p>

        {destination && (
          <div className="h-6 mb-2 flex items-center justify-center">
            {isFetchingCustom ? (
              <span className="text-xs font-semibold text-blue-500 dark:text-blue-400 flex items-center gap-2 animate-pulse">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                Discovering facts about {destination}...
              </span>
            ) : (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in duration-500">
                ✨ Personalized facts loaded!
              </span>
            )}
          </div>
        )}

        {/* Fact Carousel Container */}
        <div className="w-full bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 h-[120px] flex items-center justify-center relative overflow-hidden">
          <p 
            key={`${currentFacts[factIndex]}-${factIndex}`} // Key forces react to remount and trigger animation
            className="text-sm font-medium text-blue-800 dark:text-blue-300 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {currentFacts[factIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
