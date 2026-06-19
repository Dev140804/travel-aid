"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AnimatedHeroBackground from "@/components/AnimatedHeroBackground";
import { FaCircleInfo, FaHeart, FaBolt, FaGlobe } from "react-icons/fa6";

export default function About() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");

    if (!storedUsername) {
      window.location.href = "/login";
      return;
    }

    setIsLoading(false);
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
      <AnimatedHeroBackground />

      <div className="relative z-20 flex flex-col min-h-screen">
        <header className="flex h-20 items-center justify-center border-b border-[#D4AF37]/20 px-6 lg:px-12 backdrop-blur-md bg-[#0B1F3A]/60 relative">
          {/* Back Button - Left */}
          <button
            onClick={() => router.back()}
            className="absolute left-6 flex items-center gap-2 text-slate-300 hover:text-[#D4AF37] transition-colors font-semibold cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Center Logo and Name */}
          <div className="flex items-center gap-3 font-bold text-2xl tracking-tight">
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
        </header>

        <main className="flex-1 flex flex-col">
          <section className="flex flex-col items-center justify-center pt-20 pb-20 px-4 text-center">
            <div className="mb-6 animate-bounce">
              <FaCircleInfo className="w-24 h-24 text-[#D4AF37] mx-auto filter drop-shadow-lg" />
            </div>
            <h1 className="max-w-4xl text-6xl md:text-7xl font-black tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#E8C547] to-[#D4AF37] drop-shadow-lg">
              About Trip Planner
            </h1>
            <p className="max-w-3xl text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed drop-shadow-md">
              Revolutionizing travel planning with AI-powered itineraries
            </p>
          </section>

          <section className="py-24 px-6 lg:px-12 bg-gradient-to-b from-transparent via-[#0B1F3A]/40 to-transparent">
            <div className="max-w-5xl mx-auto space-y-16">
              {/* Mission */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-[#D4AF37]/30 p-8 md:p-12">
                <div className="flex items-start gap-6">
                  <FaBolt className="w-10 h-10 text-[#D4AF37] flex-shrink-0 mt-2" />
                  <div>
                    <h2 className="text-3xl font-bold text-[#D4AF37] mb-4">Our Mission</h2>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      Trip Planner leverages cutting-edge artificial intelligence to transform the way you plan your travels. We believe every journey should be personalized, optimized, and unforgettable. Our AI considers your preferences, budget, weather patterns, and travel times to create the perfect itinerary tailored just for you.
                    </p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-[#D4AF37]/30 p-8">
                  <FaBolt className="w-8 h-8 text-[#D4AF37] mb-4" />
                  <h3 className="text-2xl font-bold text-[#D4AF37] mb-2">AI-Powered</h3>
                  <p className="text-gray-300">Advanced machine learning algorithms optimize your travel experience with intelligent recommendations.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-[#D4AF37]/30 p-8">
                  <FaGlobe className="w-8 h-8 text-[#D4AF37] mb-4" />
                  <h3 className="text-2xl font-bold text-[#D4AF37] mb-2">Global Coverage</h3>
                  <p className="text-gray-300">Plan trips to destinations worldwide with real-time data on attractions, weather, and logistics.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-[#D4AF37]/30 p-8">
                  <FaHeart className="w-8 h-8 text-[#D4AF37] mb-4" />
                  <h3 className="text-2xl font-bold text-[#D4AF37] mb-2">Personalized</h3>
                  <p className="text-gray-300">Every itinerary is customized based on your unique preferences, budget, and travel style.</p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-[#D4AF37]/30 p-8">
                  <BoltIcon className="w-8 h-8 text-[#D4AF37] mb-4" />
                  <h3 className="text-2xl font-bold text-[#D4AF37] mb-2">Real-Time Updates</h3>
                  <p className="text-gray-300">Stay informed with live weather forecasts, traffic updates, and event recommendations.</p>
                </div>
              </div>

              {/* Version Info */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-[#D4AF37]/30 p-8 md:p-12 text-center">
                <h3 className="text-2xl font-bold text-[#D4AF37] mb-4">Version Information</h3>
                <div className="space-y-3">
                  <p className="text-gray-300">
                    <span className="font-semibold text-[#D4AF37]">Current Version:</span> 1.0.0
                  </p>
                  <p className="text-gray-300">
                    <span className="font-semibold text-[#D4AF37]">Release Date:</span> March 2026
                  </p>
                  <p className="text-gray-300">
                    <span className="font-semibold text-[#D4AF37]">Status:</span> Active & Supported
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-[#D4AF37]/30 p-8 md:p-12 text-center">
                <h3 className="text-2xl font-bold text-[#D4AF37] mb-6">Get in Touch</h3>
                <p className="text-gray-300 mb-6">Have questions or feedback? We'd love to hear from you!</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="mailto:support@tripplanner.com"
                    className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#E8C547] text-[#0B1F3A] rounded-full font-bold hover:shadow-lg hover:shadow-[#D4AF37]/50 transition-all transform hover:scale-105"
                  >
                    Email Support
                  </a>
                  <a
                    href="#"
                    className="px-6 py-3 border-2 border-[#D4AF37] text-[#D4AF37] rounded-full font-bold hover:bg-[#D4AF37]/10 transition-all"
                  >
                    Visit Website
                  </a>
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

// Icon component for the fourth feature
function BoltIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
