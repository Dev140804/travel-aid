"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import AnimatedHeroBackground from "@/components/AnimatedHeroBackground";
import { MdDirectionsRun } from "react-icons/md";
import { FaBolt, FaCloudRain } from "react-icons/fa6";
import { FaUser, FaBookmark, FaPalette, FaCircleInfo, FaRightFromBracket } from "react-icons/fa6";

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      // Redirect to login if not authenticated
      window.location.href = "/login";
    } else {
      setIsLoggedIn(true);
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1F3A] text-[#F8F9FB]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0B1F3A] text-[#F8F9FB] relative overflow-hidden">
      {/* Live Wallpaper Background */}
      <AnimatedHeroBackground />

      {/* Content Overlay */}
      <div className="relative z-20 flex flex-col min-h-screen">
        <header className="flex h-20 items-center justify-between border-b border-[#D4AF37]/20 px-6 lg:px-12 backdrop-blur-md bg-[#0B1F3A]/60">
          <div className="flex items-center gap-3 font-bold text-2xl tracking-tight group cursor-pointer">
            <div className="w-16 h-16 flex items-center justify-center">
              <Image
                src="/erasebg-transformed.png"
                alt="Trip Planner Logo"
                width={60}
                height={60}
                className="object-contain filter drop-shadow-lg"
              />
            </div>
            <div className="font-serif">
              <span className="text-2xl text-[#F8F9FB] font-light tracking-wider">Trip</span>
              <span className="text-2xl text-[#D4AF37] font-semibold"> Planner</span>
            </div>
          </div>
          
          {isLoggedIn ? (
            // Settings Icon with Dropdown (When Logged In)
            <div className="relative">
                <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-[#D4AF37]/20 rounded-lg transition-colors cursor-pointer"
                title="Settings"
              >
                <svg
                  className="w-6 h-6 theme-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showSettings && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0B1F3A]/95 border border-[#D4AF37]/30 rounded-lg shadow-lg backdrop-blur-md z-50">
                    <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[#F8F9FB] hover:bg-[#D4AF37]/20 border-b border-[#D4AF37]/10 transition-colors cursor-pointer"
                    onClick={() => setShowSettings(false)}
                  >
                    <FaUser className="w-4 h-4 theme-accent" />
                    Profile
                  </Link>
                  <Link
                    href="/saved-trips"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[#F8F9FB] hover:bg-[#D4AF37]/20 border-b border-[#D4AF37]/10 transition-colors cursor-pointer"
                    onClick={() => setShowSettings(false)}
                  >
                    <FaBookmark className="w-4 h-4 theme-accent" />
                    Saved Trips
                  </Link>
                  <Link
                    href="/theme"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[#F8F9FB] hover:bg-[#D4AF37]/20 border-b border-[#D4AF37]/10 transition-colors cursor-pointer"
                    onClick={() => setShowSettings(false)}
                  >
                    <FaPalette className="w-4 h-4 theme-accent" />
                    Theme
                  </Link>
                  <Link
                    href="/about"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[#F8F9FB] hover:bg-[#D4AF37]/20 border-b border-[#D4AF37]/10 transition-colors cursor-pointer"
                    onClick={() => setShowSettings(false)}
                  >
                    <FaCircleInfo className="w-4 h-4 theme-accent" />
                    About
                  </Link>
                          <Link
                    href="/signout"
                    className="w-full flex items-center gap-3 text-left px-4 py-3 text-sm text-[#F8F9FB] hover:bg-[#D4AF37]/20 transition-colors cursor-pointer"
                  >
                    <FaRightFromBracket className="w-4 h-4 theme-accent" />
                    Sign Out
                  </Link>
                </div>
              )}
            </div>
          ) : (
            // Login/Signup Links (When Not Logged In)
            <nav className="flex gap-6 items-center">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 cursor-pointer"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium bg-gradient-to-r from-[#D4AF37] to-[#E8C547] text-[#0B1F3A] px-6 py-2 rounded-full hover:shadow-lg hover:shadow-[#D4AF37]/50 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                Sign up
              </Link>
            </nav>
          )}
        </header>

        <main className="flex-1 flex flex-col">
          {/* Hero Section */}
          <section className="flex flex-col items-center justify-center pt-20 pb-20 px-4 text-center flex-1">
            <div className="mb-6 animate-bounce">
              <Image
                src="/erasebg-transformed.png"
                alt="Trip Planner"
                width={150}
                height={150}
                className="object-contain mx-auto filter drop-shadow-lg"
              />
            </div>
            <h1 className="max-w-4xl text-6xl md:text-7xl font-black tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#E8C547] to-[#D4AF37] drop-shadow-lg">
              Plan Your Dream Trip in Seconds
            </h1>
            <p className="max-w-3xl text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed drop-shadow-md">
              AI-powered personalized itineraries that account for travel times,
              weather, and smart local recommendations
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/plan-trip"
                className="flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E8C547] text-[#0B1F3A] hover:shadow-2xl hover:shadow-[#D4AF37]/50 transition-all transform hover:scale-105 active:scale-95 shadow-lg backdrop-blur-sm cursor-pointer"
              >
                Start Planning Now
              </Link>
              <Link
                href="/plan-trip?mode=vehicle"
                className="flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all transform hover:scale-105 active:scale-95 backdrop-blur-sm bg-[#0B1F3A]/30 cursor-pointer"
              >
                Plan With Your Vehicle
              </Link>
              <Link
                href="/popular-trips"
                className="flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all transform hover:scale-105 active:scale-95 backdrop-blur-sm bg-[#0B1F3A]/30 cursor-pointer"
              >
                Popular Trips
              </Link>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-24 px-6 lg:px-12 bg-gradient-to-b from-transparent via-[#0B1F3A]/40 to-transparent">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-5xl font-black text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#E8C547]">
                How it Works
              </h2>
              <p className="text-center text-gray-300 text-lg mb-16 max-w-2xl mx-auto">
                Powered by advanced AI to create unforgettable travel experiences
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="group relative cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl"></div>
                  <div className="relative flex flex-col items-center text-center p-8 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 group-hover:border-blue-400/50 transition-all transform group-hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#D4AF37] to-[#E8C547] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-[#D4AF37]/30">
                      <FaBolt className="w-8 h-8 text-[#0B1F3A]" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-[#D4AF37]">
                      AI-Powered Itineraries
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Our advanced AI creates optimized daily schedules based on
                      your preferences, ensuring you make the most of every
                      moment.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="group relative cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl"></div>
                  <div className="relative flex flex-col items-center text-center p-8 bg-white/10 rounded-2xl backdrop-blur-md border border-[#D4AF37]/20 group-hover:border-[#D4AF37]/50 transition-all transform group-hover:-translate-y-2">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#D4AF37] to-[#E8C547] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-[#D4AF37]/30">
                      <MdDirectionsRun className="w-8 h-8 text-[#0B1F3A]" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-[#D4AF37]">
                      Smart Time Management
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      We automatically adjust for travel times between
                      destinations so you never rush and always arrive on time.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="group relative cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl"></div>
                  <div className="relative flex flex-col items-center text-center p-8 bg-white/10 rounded-2xl backdrop-blur-md border border-[#D4AF37]/20 group-hover:border-[#D4AF37]/50 transition-all transform group-hover:-translate-y-2">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#D4AF37] to-[#E8C547] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-[#D4AF37]/30">
                      <FaCloudRain className="w-8 h-8 text-[#0B1F3A]" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-[#D4AF37]">
                      Weather Adaptive
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Plans are intelligently adjusted based on real-time weather
                      forecasts, suggesting indoor activities when it rains.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-white/10 py-12 text-center text-sm text-gray-400 backdrop-blur-md bg-[#0B1F3A]/40">
          <p>
            © {new Date().getFullYear()} Trip Planner. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}