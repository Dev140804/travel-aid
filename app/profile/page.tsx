"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AnimatedHeroBackground from "@/components/AnimatedHeroBackground";
import { FaUser, FaEnvelope, FaPhone, FaMapPin, FaCalendar } from "react-icons/fa6";

export default function Profile() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedFirstName = localStorage.getItem("userFirstName");

    if (!storedUsername) {
      window.location.href = "/login";
      return;
    }

    setUserName(storedUsername);
    setUserFirstName(storedFirstName || storedUsername);
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
              <FaUser className="w-24 h-24 text-[#D4AF37] mx-auto filter drop-shadow-lg" />
            </div>
            <h1 className="max-w-4xl text-6xl md:text-7xl font-black tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#E8C547] to-[#D4AF37] drop-shadow-lg">
              Your Profile
            </h1>
            <p className="max-w-3xl text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed drop-shadow-md">
              Manage your account information and preferences
            </p>
          </section>

          <section className="py-24 px-6 lg:px-12 bg-gradient-to-b from-transparent via-[#0B1F3A]/40 to-transparent">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-[#D4AF37]/30 p-8 shadow-lg">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 pb-6 border-b border-[#D4AF37]/20">
                    <FaUser className="text-[#D4AF37] w-6 h-6" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Username</p>
                      <p className="text-lg text-[#F8F9FB] font-semibold">{userName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pb-6 border-b border-[#D4AF37]/20">
                    <FaUser className="text-[#D4AF37] w-6 h-6" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Display Name</p>
                      <p className="text-lg text-[#F8F9FB] font-semibold">{userFirstName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pb-6 border-b border-[#D4AF37]/20">
                    <FaEnvelope className="text-[#D4AF37] w-6 h-6" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Email</p>
                      <p className="text-lg text-[#F8F9FB] font-semibold">user@tripplanner.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pb-6 border-b border-[#D4AF37]/20">
                    <FaPhone className="text-[#D4AF37] w-6 h-6" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Phone</p>
                      <p className="text-lg text-[#F8F9FB] font-semibold">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pb-6 border-b border-[#D4AF37]/20">
                    <FaMapPin className="text-[#D4AF37] w-6 h-6" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Location</p>
                      <p className="text-lg text-[#F8F9FB] font-semibold">New York, USA</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <FaCalendar className="text-[#D4AF37] w-6 h-6" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-1">Member Since</p>
                      <p className="text-lg text-[#F8F9FB] font-semibold">March 2026</p>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-8 px-8 py-3 text-lg font-bold rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E8C547] text-[#0B1F3A] hover:shadow-2xl hover:shadow-[#D4AF37]/50 transition-all transform hover:scale-105 active:scale-95 cursor-pointer">
                  Edit Profile
                </button>
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
