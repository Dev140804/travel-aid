"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AnimatedHeroBackground from "@/components/AnimatedHeroBackground";
import { FaArrowRight, FaStar } from "react-icons/fa6";
import { IconCalendar, IconMoney, IconPin } from "@/components/Icons";

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: number;
  budget: string;
  tripType: string;
  companion: string;
  pace: string;
  rating: number;
  hotelCount: number;
  selectedHotel: string;
  thumbnailImage: string | null;
  createdAt: string;
  usageCount: number;
}

export default function PopularTripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"rating-high" | "rating-low" | "newest" | "none">("rating-high");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filter, setFilter] = useState({
    minRating: 0,
    budgetType: "" as "" | "Budget" | "Moderate" | "Luxury",
    tripType: "" as string,
  });
  const [tempFilter, setTempFilter] = useState(filter);

  useEffect(() => {
    const loadTrips = async () => {
      try {
        // For now there are no completed customer trips to display.
        // Keep the page blank and avoid API fetch errors.
        setTrips([]);
      } catch (error) {
        console.error("Error loading trips:", error);
        setTrips([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrips();
  }, []);

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch =
        trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.selectedHotel.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRating = trip.rating >= filter.minRating;
      const matchesBudget = !filter.budgetType || trip.budget === filter.budgetType;
      const matchesTripType = !filter.tripType || trip.tripType.includes(filter.tripType);

      return matchesSearch && matchesRating && matchesBudget && matchesTripType;
    });
  }, [trips, searchQuery, filter]);

  const sortedTrips = useMemo(() => {
    const data = [...filteredTrips];
    if (sortBy === "rating-high") {
      return data.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "rating-low") {
      return data.sort((a, b) => a.rating - b.rating);
    } else if (sortBy === "newest") {
      return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return data;
  }, [filteredTrips, sortBy]);

  const uniqueBudgets = useMemo(() => {
    return Array.from(new Set(trips.map((t) => t.budget)));
  }, [trips]);

  const uniqueTripTypes = useMemo(() => {
    const types = new Set<string>();
    trips.forEach((t) => {
      t.tripType.split(",").forEach((type) => types.add(type.trim()));
    });
    return Array.from(types);
  }, [trips]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const handleSelectTrip = (trip: Trip) => {
    localStorage.setItem("travel-ai-selected-trip", JSON.stringify(trip));
    router.push(`/plan-trip?tripId=${trip.id}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0B1F3A] text-[#F8F9FB] relative overflow-hidden">
      <AnimatedHeroBackground />

      <div className="relative z-20 flex flex-col min-h-screen">
        {/* Header */}
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

        {/* Main Content */}
        <main className="relative z-10 flex-1">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
            {/* Page Header */}
            <div className="mb-12">
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#E8C547] mb-4">
                Popular Trips
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl">
                Explore top-rated trips planned by travelers. Get inspired by their itineraries and customize them for your own adventure.
              </p>
            </div>
            {/* Search and Filter Controls */}
            <div className="mb-8 flex flex-col gap-4">
              <div className="flex gap-3 items-center flex-wrap">
                <div className="flex-1 min-w-64">
                  <input
                    type="text"
                    placeholder="Search by destination, hotel..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-[#F8F9FB] placeholder-slate-400 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-3 bg-white/10 border border-white/20 hover:bg-white/20 text-[#F8F9FB] rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  <option value="none">Sort By</option>
                  <option value="rating-high">⭐ Rating: High to Low</option>
                  <option value="rating-low">⭐ Rating: Low to High</option>
                  <option value="newest">Newest First</option>
                </select>
                <button
                  onClick={() => {
                    setTempFilter(filter);
                    setShowFilterModal(true);
                  }}
                  className="px-4 py-3 bg-white/10 border border-white/20 hover:bg-white/20 text-[#F8F9FB] rounded-lg font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  Filter
                  <span>▼</span>
                </button>
              </div>
            </div>

            {/* Filter Modal */}
            {showFilterModal && (
              <div className="fixed inset-0 bg-[#0B1F3A]/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white/10 border border-white/20 rounded-lg max-w-md w-full mx-4 shadow-2xl">
                  <div className="px-6 pt-6 pb-2 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[#F8F9FB]">⚙️ Filter Options</h2>
                    <button
                      onClick={() => setShowFilterModal(false)}
                      className="text-slate-300 hover:text-[#F8F9FB] text-2xl font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="px-6 py-4 space-y-6">
                    {/* Rating Filter */}
                    <div>
                      <label className="text-sm uppercase tracking-wider text-slate-300 block mb-3">
                        Min Rating
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={5}
                        step={0.5}
                        value={tempFilter.minRating}
                        onChange={(e) =>
                          setTempFilter({ ...tempFilter, minRating: Number(e.target.value) })
                        }
                        className="w-full"
                      />
                      <div className="text-xs text-slate-400 mt-2">
                        ⭐ {tempFilter.minRating > 0 ? `${tempFilter.minRating}+ stars` : "All ratings"}
                      </div>
                    </div>

                    {/* Budget Filter */}
                    <div>
                      <label className="text-sm uppercase tracking-wider text-slate-300 block mb-3">
                        Budget Type
                      </label>
                      <select
                        value={tempFilter.budgetType}
                        onChange={(e) =>
                          setTempFilter({ ...tempFilter, budgetType: e.target.value as any })
                        }
                        className="w-full rounded-md p-2 bg-white/10 border border-white/20 text-[#F8F9FB]"
                      >
                        <option value="">All Budgets</option>
                        {uniqueBudgets.map((budget) => (
                          <option key={budget} value={budget}>
                            {budget}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Trip Type Filter */}
                    <div>
                      <label className="text-sm uppercase tracking-wider text-slate-300 block mb-3">
                        Trip Type
                      </label>
                      <select
                        value={tempFilter.tripType}
                        onChange={(e) =>
                          setTempFilter({ ...tempFilter, tripType: e.target.value })
                        }
                        className="w-full rounded-md p-2 bg-white/10 border border-white/20 text-[#F8F9FB]"
                      >
                        <option value="">All Types</option>
                        {uniqueTripTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-white/5 rounded-b-lg flex items-center justify-between border-t border-white/20">
                    <button
                      onClick={() => {
                        setTempFilter({ minRating: 0, budgetType: "", tripType: "" });
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-[#F8F9FB] rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => {
                        setFilter(tempFilter);
                        setShowFilterModal(false);
                      }}
                      className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E8C547] text-[#0B1F3A] rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Apply Filter
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Results Count */}
            {!isLoading && (
              <div className="mb-8">
                <p className="text-sm text-slate-300">
                  Showing <span className="font-bold text-[#D4AF37]">{sortedTrips.length}</span> {sortedTrips.length === 1 ? "trip" : "trips"}
                </p>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-300">Loading popular trips...</p>
                </div>
              </div>
            ) : sortedTrips.length === 0 ? (
              <div className="bg-white/10 border border-white/20 rounded-xl p-12 text-center">
                <p className="text-lg text-slate-300 mb-2">No trips are available yet.</p>
                <p className="text-sm text-slate-400">Nobody has completed a trip through our service yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="group bg-white/10 border border-white/20 rounded-xl overflow-hidden hover:border-[#D4AF37]/50 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => handleSelectTrip(trip)}
                  >
                    {/* Image */}
                    <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900">
                      {trip.thumbnailImage ? (
                        <img
                          src={trip.thumbnailImage}
                          alt={trip.destination}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400">
                          <span className="text-sm">No image available</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Rating Badge */}
                      <div className="absolute top-3 right-3 bg-[#D4AF37] text-[#0B1F3A] rounded-full px-3 py-1 font-bold text-sm flex items-center gap-1 shadow-lg">
                        <FaStar size={14} /> {trip.rating.toFixed(1)}
                      </div>

                      {/* Popularity Badge */}
                      <div className="absolute top-3 left-3 bg-[#E8C547] text-[#0B1F3A] rounded-full px-3 py-1 font-bold text-sm flex items-center gap-1 shadow-lg">
                        <span>👥</span> {trip.usageCount} {trip.usageCount === 1 ? "person" : "people"}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Destination */}
                      <h3 className="text-xl font-bold text-[#D4AF37] mb-1 group-hover:text-[#E8C547] transition-colors">
                        {trip.destination.toUpperCase()}
                      </h3>
                      <p className="text-sm text-slate-400 mb-4"><IconPin style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6, color: 'var(--theme-accent)' }} /> {trip.selectedHotel}</p>

                      {/* Trip Details */}
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400"><IconCalendar style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6, color: 'var(--theme-accent)' }} /> Duration:</span>
                          <span className="text-slate-200 font-semibold">{trip.days} days</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400"><IconMoney style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6, color: 'var(--theme-accent)' }} /> Budget:</span>
                          <span className="text-slate-200 font-semibold">{trip.budget}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">👥 Companion:</span>
                          <span className="text-slate-200 font-semibold">{trip.companion}</span>
                        </div>
                      </div>

                      {/* Trip Type Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {trip.tripType.split(",").slice(0, 2).map((type, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-1 rounded-full"
                          >
                            {type.trim()}
                          </span>
                        ))}
                      </div>

                      {/* Button */}
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#D4AF37] to-[#E8C547] hover:from-[#E8C547] hover:to-[#D4AF37] text-[#0B1F3A] rounded-lg font-bold transition-all transform group-hover:scale-105 active:scale-95 cursor-pointer">
                        View Itinerary
                        <FaArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
