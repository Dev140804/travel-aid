"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AnimatedHeroBackground from "@/components/AnimatedHeroBackground";
import { FaBookmark, FaCalendar, FaClock, FaArrowRight, FaTrash } from "react-icons/fa6";

interface Trip {
  id: string;
  destination: string;
  days: number;
  createdAt: string;
}

export default function SavedTrips() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");

    if (!storedUsername) {
      window.location.href = "/login";
      return;
    }

    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await fetch("/api/trips");
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
      }
    } catch (error) {
      console.error("Failed to fetch trips:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const handleDelete = async (tripId: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;

    setDeletingId(tripId);
    try {
      const res = await fetch(`/api/trips?id=${tripId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTrips(trips.filter(trip => trip.id !== tripId));
      } else {
        alert("Failed to delete trip");
      }
    } catch (error) {
      console.error("Failed to delete trip:", error);
      alert("Failed to delete trip");
    } finally {
      setDeletingId(null);
    }
  };

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
              <FaBookmark className="w-24 h-24 text-[#D4AF37] mx-auto filter drop-shadow-lg" />
            </div>
            <h1 className="max-w-4xl text-6xl md:text-7xl font-black tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#E8C547] to-[#D4AF37] drop-shadow-lg">
              Saved Trips
            </h1>
            <p className="max-w-3xl text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed drop-shadow-md">
              Your recent itineraries and planned adventures
            </p>
          </section>

          <section className="py-24 px-6 lg:px-12 bg-gradient-to-b from-transparent via-[#0B1F3A]/40 to-transparent">
            <div className="max-w-6xl mx-auto">
              {trips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {trips.map((trip) => (
                    <div
                      key={trip.id}
                      className="group relative bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-2xl border border-[#D4AF37]/30 p-6 hover:border-[#D4AF37]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-[#D4AF37]/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="relative z-10 space-y-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-2xl font-bold text-[#D4AF37] group-hover:text-[#E8C547] transition-colors flex-1">
                            {trip.destination}
                          </h3>
                          <button
                            onClick={() => handleDelete(trip.id)}
                            disabled={deletingId === trip.id}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                            title="Delete trip"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-gray-300 text-lg flex items-center gap-2">
                          <span className="text-[#D4AF37]">🏖️</span>
                          {trip.days} {trip.days === 1 ? "Day" : "Days"}
                        </p>

                        <div className="flex items-center gap-4 pt-4 border-t border-[#D4AF37]/20">
                          <div className="flex items-center gap-2 text-gray-300">
                            <FaCalendar className="w-4 h-4 text-[#D4AF37]" />
                            <span className="text-sm">Created {formatDate(trip.createdAt)}</span>
                          </div>
                        </div>

                        <Link
                          href={`/plan-trip?tripId=${trip.id}`}
                          className="inline-flex items-center gap-2 mt-4 px-6 py-2 text-sm font-bold text-[#D4AF37] hover:text-[#E8C547] transition-colors group/link"
                        >
                          View Itinerary
                          <FaArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaBookmark className="w-16 h-16 text-[#D4AF37]/30 mx-auto mb-4" />
                  <p className="text-gray-300 text-lg">No saved trips yet. Start planning your first adventure!</p>
                  <Link
                    href="/plan-trip"
                    className="inline-block mt-6 px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#E8C547] text-[#0B1F3A] rounded-full font-bold hover:shadow-lg hover:shadow-[#D4AF37]/50 transition-all"
                  >
                    Plan Your Trip
                  </Link>
                </div>
              )}
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
