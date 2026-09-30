"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/components/LoadingOverlay";
import { IconSettings, IconMoney, IconPin, IconCalendar } from "@/components/Icons";

type Place = {
  id?: string;
  name: string;
  rating?: number;
  photo_reference?: string | null;
  imageUrl?: string;
  location?: { lat: number; lng: number } | null;
  priceLevel?: number;
  price_level?: number;
  baseNightly?: number;
  currency?: string;
  address?: string;
  phone?: string;
  website?: string;
  priceSource?: "booking" | "calculated";
  bookingUrl?: string | null;
};

export default function HotelSearchPage() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      setDestination(sp.get("destination") || "");
      setStartDate(sp.get("startDate") || "");
      setEndDate(sp.get("endDate") || "");
    } catch (err) {
      // ignore when window isn't available or parsing fails
    }
  }, []);

  const [tab, setTab] = useState<"hotels" | "rooms" | "airbnb">("hotels");
  const [hotels, setHotels] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewAll, setViewAll] = useState(true);
  
  // Per-tab filter and sort settings
  const [filterSettings, setFilterSettings] = useState<{
    hotels: { ratingMin: number; priceRange: number };
    rooms: { ratingMin: number; priceRange: number };
    airbnb: { ratingMin: number; priceRange: number };
  }>({
    hotels: { ratingMin: 3, priceRange: 0 },
    rooms: { ratingMin: 3, priceRange: 0 },
    airbnb: { ratingMin: 3, priceRange: 0 },
  });

  const [sortSettings, setSortSettings] = useState<{
    hotels: "none" | "price-low" | "price-high" | "rating-high" | "rating-low";
    rooms: "none" | "price-low" | "price-high" | "rating-high" | "rating-low";
    airbnb: "none" | "price-low" | "price-high" | "rating-high" | "rating-low";
  }>({
    hotels: "none",
    rooms: "none",
    airbnb: "none",
  });

  // Current tab filter and sort values
  const [tempRatingMin, setTempRatingMin] = useState(filterSettings[tab].ratingMin);
  const [tempPriceRange, setTempPriceRange] = useState(filterSettings[tab].priceRange);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    if (!destination) return;
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const url = `/api/hotels?destination=${encodeURIComponent(destination)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Hotel API returned error");
        const data = await res.json();
        setHotels(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Could not fetch hotels. Please check your destination or API key.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [destination]);

  useEffect(() => {
    if (showFilterModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showFilterModal]);

  // Load filter and sort settings when tab changes
  useEffect(() => {
    setTempRatingMin(filterSettings[tab].ratingMin);
    setTempPriceRange(filterSettings[tab].priceRange);
  }, [tab, filterSettings]);

  const rooms = useMemo(() => {
    return hotels.map((hotel, i) => ({
      name: hotel.name + " - Deluxe Room",
      rating: hotel.rating,
      priceLevel: 2 + (i % 3),
      type: "Room",
      location: hotel.location,
      imageUrl: hotel.imageUrl || (hotel.photo_reference ? `/api/photo?ref=${hotel.photo_reference}` : undefined),
      photo_reference: hotel.photo_reference || undefined,
      address: hotel.address,
      phone: hotel.phone,
      website: hotel.website,
      baseNightly: hotel.baseNightly,
      priceSource: hotel.priceSource,
      bookingUrl: hotel.bookingUrl,
    }));
  }, [hotels]);

  const airbnbs = useMemo(() => {
    const base = destination.toLowerCase();
    const list = base.includes("manali")
      ? [
          { name: "Cozy Manali Homestay", rating: 4.7, priceLevel: 2, imageUrl: "https://source.unsplash.com/featured/?manali,homestay", baseNightly: 65 },
          { name: "Mountain View Airbnb", rating: 4.4, priceLevel: 3, imageUrl: "https://source.unsplash.com/featured/?manali,mountain", baseNightly: 75 },
        ]
      : [
          { name: `${destination} City Center Airbnb`, rating: 4.5, priceLevel: 2, imageUrl: `https://source.unsplash.com/featured/?${encodeURIComponent(destination)},airbnb`, baseNightly: 80 },
          { name: `${destination} Hillside Villa`, rating: 4.2, priceLevel: 3, imageUrl: `https://source.unsplash.com/featured/?${encodeURIComponent(destination)},villa`, baseNightly: 90 },
        ];

    return list.map((item) => ({ ...item, type: "Airbnb" }));
  }, [destination]);

  const hotelsWithPrice = useMemo(() => {
    const rateByPriceLevel = (level: number) => {
      const bands = [1800, 2500, 3200, 4200, 5400];
      return bands[Math.max(0, Math.min(4, level))];
    };

    return hotels.map((hotel) => {
      const rating = hotel.rating ?? 0;
      const priceLevel = (hotel.price_level ?? hotel.priceLevel ?? (hotel.rating ? Math.max(0, Math.min(4, Math.round(5 - rating))) : 2));
      const defaultNightly = hotel.baseNightly ?? rateByPriceLevel(priceLevel) ?? Math.round(2000 + (5 - rating) * 700);

      return {
        ...hotel,
        priceLevel: Math.max(1, Math.min(5, Math.round(priceLevel + 1))),
        baseNightly: defaultNightly,
      };
    });
  }, [hotels]);

  const nights = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Calculate hotel nights (check-in to check-out)
    // E.g., 16/03 to 18/03 = 2 nights (16th night, 17th night)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  }, [startDate, endDate]);

  const days = useMemo(() => {
    // Activity days are inclusive of both start and end dates
    // E.g., 16/03 to 18/03 = 3 days (16, 17, 18)
    return nights + 1;
  }, [nights]);

  // Calculate exactly 4 dynamic price ranges based on actual data
  const getDynamicPriceRanges = useMemo(() => {
    // Get all nightly prices from current tab
    let allPrices: number[] = [];
    if (tab === "hotels") {
      allPrices = hotelsWithPrice.map(h => h.baseNightly || 0);
    } else if (tab === "rooms") {
      allPrices = rooms.map(r => r.baseNightly || 0);
    } else if (tab === "airbnb") {
      allPrices = airbnbs.map(a => a.baseNightly || 0);
    }

    if (allPrices.length === 0) return [];

    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);

    // Always create exactly 4 price ranges with nice round numbers
    const priceRange = maxPrice - minPrice;
    let rawRangeSize = priceRange / 4;
    
    // Round to nearest nice number (50, 100, 250, 500, 1000, etc.)
    let rangeSize: number;
    if (rawRangeSize <= 50) rangeSize = 50;
    else if (rawRangeSize <= 100) rangeSize = 100;
    else if (rawRangeSize <= 250) rangeSize = 250;
    else if (rawRangeSize <= 500) rangeSize = 500;
    else if (rawRangeSize <= 1000) rangeSize = 1000;
    else if (rawRangeSize <= 2500) rangeSize = 2500;
    else if (rawRangeSize <= 5000) rangeSize = 5000;
    else rangeSize = Math.ceil(rawRangeSize / 1000) * 1000;
    
    const ranges: { min: number; max: number; label: string }[] = [];
    
    for (let i = 0; i < 4; i++) {
      const rangeMin = minPrice + (i * rangeSize);
      const rangeMax = i === 3 ? maxPrice + 1 : minPrice + ((i + 1) * rangeSize);
      
      ranges.push({
        min: rangeMin,
        max: rangeMax,
        label: `₹${Math.round(rangeMin).toLocaleString("en-IN")} - ₹${Math.round(rangeMax - 1).toLocaleString("en-IN")}`
      });
    }

    return ranges.length > 0 ? ranges : [{ min: 0, max: Infinity, label: "All prices" }];
  }, [tab, hotelsWithPrice, rooms, airbnbs]);

  const getTotalPrice = (nightly: number) => nightly * nights;

  const appliedRatingMin = filterSettings[tab].ratingMin;
  const appliedPriceRange = filterSettings[tab].priceRange;

  const filteredHotels = useMemo(() => {
    if (getDynamicPriceRanges.length === 0) return [];
    
    const selectedRange = getDynamicPriceRanges[appliedPriceRange];
    if (!selectedRange) return hotelsWithPrice;

    return hotelsWithPrice.filter((hotel) => {
      const ratingOk = (hotel.rating || 0) >= appliedRatingMin;
      const nightlyPrice = hotel.baseNightly || 0;
      const priceOk = nightlyPrice >= selectedRange.min && nightlyPrice < selectedRange.max;
      const searchOk = hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) || hotel.address?.toLowerCase().includes(searchQuery.toLowerCase());
      return ratingOk && priceOk && searchOk;
    });
  }, [hotelsWithPrice, appliedRatingMin, appliedPriceRange, getDynamicPriceRanges, searchQuery]);

  const filteredRooms = useMemo(() => {
    if (getDynamicPriceRanges.length === 0) return [];
    
    const selectedRange = getDynamicPriceRanges[appliedPriceRange];
    if (!selectedRange) return rooms;

    return rooms.filter((room) => {
      const ratingOk = (room.rating || 0) >= appliedRatingMin;
      const nightlyPrice = room.baseNightly || 0;
      const priceOk = nightlyPrice >= selectedRange.min && nightlyPrice < selectedRange.max;
      const searchOk = room.name.toLowerCase().includes(searchQuery.toLowerCase()) || room.address?.toLowerCase().includes(searchQuery.toLowerCase());
      return ratingOk && priceOk && searchOk;
    });
  }, [rooms, appliedRatingMin, appliedPriceRange, getDynamicPriceRanges, searchQuery]);

  const onSelectPlace = (hotel: Place) => {
    const stayType = tab;
    const data = { ...hotel, stayType };
    localStorage.setItem("travel-ai-selected-hotel", JSON.stringify(data));
    router.push(`/plan-trip`);
  };

  const getBookingLink = (hotel: Place) => {
    // If we have a booking URL from API, use it
    if ((hotel as any).bookingUrl) {
      return (hotel as any).bookingUrl;
    }
    // Otherwise, create a Booking.com search link
    return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.name + " " + destination)}`;
  };

  const displayData = useMemo(() => {
    let data: any[] = tab === "hotels" ? filteredHotels : tab === "rooms" ? filteredRooms : airbnbs;
    
    // Apply filters to airbnbs
    if (tab === "airbnb") {
      if (getDynamicPriceRanges.length > 0) {
        const selectedRange = getDynamicPriceRanges[appliedPriceRange];
        if (selectedRange) {
          data = data.filter((item: any) => {
            const ratingOk = (item.rating || 0) >= appliedRatingMin;
            const nightlyPrice = item.baseNightly || 0;
            const priceOk = nightlyPrice >= selectedRange.min && nightlyPrice < selectedRange.max;
            const searchOk = !searchQuery.trim() || item.name.toLowerCase().includes(searchQuery.toLowerCase());
            return ratingOk && priceOk && searchOk;
          });
        }
      }
    }
    
    return data;
  }, [tab, filteredHotels, filteredRooms, airbnbs, appliedRatingMin, appliedPriceRange, getDynamicPriceRanges, searchQuery]);

  const sortedData = useMemo(() => {
    const data = [...displayData];
    const currentSortBy = sortSettings[tab];
    
    if (currentSortBy === "price-low") {
      return data.sort((a, b) => (a.baseNightly || 0) - (b.baseNightly || 0));
    } else if (currentSortBy === "price-high") {
      return data.sort((a, b) => (b.baseNightly || 0) - (a.baseNightly || 0));
    } else if (currentSortBy === "rating-high") {
      return data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (currentSortBy === "rating-low") {
      return data.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    }
    
    return data;
  }, [displayData, tab, sortSettings]);

  const resultsData = useMemo(() => {
    // Show all results (no pagination)
    return sortedData;
  }, [sortedData]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push(`/plan-trip`)}
            className="text-slate-300 hover:text-white text-sm font-semibold transition-colors flex items-center gap-1"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold">Hotel & Stay Picker</h1>
          <div className="w-16"></div>
        </div>
        <p className="text-slate-300 mb-6">
          Destination: <strong>{destination || "(no destination)"}</strong>. 
          Choose from Hotels / Rooms / Airbnb, filter by rating and price, then tap Select to return to itinerary.
        </p>

        {/* Tabs */}
        <div className="mb-5 flex flex-wrap gap-2">
          {[("hotels"), ("rooms"), ("airbnb")].map((option) => (
            <button
              key={option}
              onClick={() => setTab(option as any)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold ${tab === option ? "bg-blue-500 text-white" : "bg-white/10 text-slate-200"}`}
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Search Box and Filter Label */}
        <div className="mb-6 flex gap-3 items-center">
          <div className="flex-1 bg-white/10 border border-white/20 rounded-lg p-3">
            <input
              type="text"
              placeholder="🔍 Search by name, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-md px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={sortSettings[tab]}
            onChange={(e) => setSortSettings({ ...sortSettings, [tab]: e.target.value as any })}
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors border border-slate-600 cursor-pointer"
          >
            <option value="none">Sort By</option>
            <option value="price-low">{""}<IconMoney style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6, color: 'var(--theme-accent)' }} /> Price: Low to High</option>
            <option value="price-high">{""}<IconMoney style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6, color: 'var(--theme-accent)' }} /> Price: High to Low</option>
            <option value="rating-high">⭐ Rating: High to Low</option>
            <option value="rating-low">⭐ Rating: Low to High</option>
          </select>
          <button
            onClick={() => {
              setTempRatingMin(appliedRatingMin);
              setTempPriceRange(appliedPriceRange);
              setShowFilterModal(true);
            }}
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 border border-slate-600"
          >
            Filter
            <span>▼</span>
          </button>
        </div>

        {/* Filter Modal Popup */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg max-w-md w-full mx-4 border border-white/20 shadow-2xl relative">
              {/* Header */}
              <div className="px-6 pt-6 pb-2 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><IconSettings style={{ color: 'var(--theme-accent)' }} /> Filter Options</h2>
                {/* Close button at top right inside the box */}
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="text-slate-300 hover:text-white text-2xl font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-4">
                {/* Rating Filter */}
                <div className="mb-6">
                  <label className="text-sm uppercase tracking-wider text-slate-300 block mb-3">Min Rating</label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={0.5}
                    value={tempRatingMin}
                    onChange={(e) => setTempRatingMin(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-slate-400 mt-2">{tempRatingMin}+ stars</div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                  <label className="text-sm uppercase tracking-wider text-slate-300 block mb-3">Price per Night</label>
                  <select value={tempPriceRange} onChange={(e) => setTempPriceRange(Number(e.target.value))} className="w-full rounded-md p-2 bg-slate-700 text-white border border-slate-600">
                    {getDynamicPriceRanges.map((range, idx) => (
                      <option key={idx} value={idx}>{range.label}/night</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Footer with buttons */}
              <div className="px-6 py-4 bg-slate-900/50 rounded-b-lg flex items-center justify-between border-t border-slate-700">
                {/* Reset button at bottom left */}
                <button
                  onClick={() => {
                    setTempRatingMin(3);
                    setTempPriceRange(0);
                  }}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Reset
                </button>

                {/* Apply Filter button at bottom right */}
                <button
                  onClick={() => {
                    setFilterSettings({
                      ...filterSettings,
                      [tab]: { ratingMin: tempRatingMin, priceRange: tempPriceRange }
                    });
                    setShowFilterModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-red-300">{error}</p>}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-r-4 border-emerald-500 animate-spin" style={{ animationDelay: '150ms' }}></div>
              <div className="absolute inset-4 rounded-full border-b-4 border-violet-500 animate-spin" style={{ animationDelay: '300ms' }}></div>
              <div className="absolute inset-0 flex items-center justify-center text-xl">
                ✈️
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Loading {tab}...</h3>
            <p className="text-slate-300 text-sm">Finding the best options for you</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-4">
              <div>
                <p className="text-sm text-slate-300">
                  {tab === "hotels" && hotelsWithPrice.length > 0 ? (
                    <>
                      🔍 Showing <span className="font-bold text-blue-400">{hotelsWithPrice.length}</span> results are found
                    </>
                  ) : tab === "rooms" && rooms.length > 0 ? (
                    <>
                      🔍 Showing <span className="font-bold text-blue-400">{rooms.length}</span> results are found
                    </>
                  ) : tab === "airbnb" && airbnbs.length > 0 ? (
                    <>
                      🔍 Showing <span className="font-bold text-blue-400">{airbnbs.length}</span> results are found
                    </>
                  ) : displayData.length === 0 ? (
                    <>No {tab} found</>
                  ) : (
                    <>🔍 Showing <span className="font-bold text-blue-400">{resultsData.length}</span> results are found</>
                  )}
                </p>
              </div>
              {sortSettings[tab] !== "none" && (
                <div className="text-sm text-slate-300">
                  <span className="font-semibold">Sorted by:</span>{" "}
                  {sortSettings[tab] === "price-low" && "💰 Price: Low to High"}
                  {sortSettings[tab] === "price-high" && "💰 Price: High to Low"}
                  {sortSettings[tab] === "rating-high" && "⭐ Rating: High to Low"}
                  {sortSettings[tab] === "rating-low" && "⭐ Rating: Low to High"}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resultsData.length === 0 ? (
              <div className="bg-white/10 p-6 rounded-xl text-slate-300">No {tab} matches current filters.</div>
            ) : (
              resultsData.map((item, idx) => (
                <div key={`${item.name}-${idx}`} className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/15 overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
                  {((item as any).photo_reference || (item as any).imageUrl) ? (
                    <div className="relative h-48 w-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          (item as any).imageUrl 
                            ? (item as any).imageUrl
                            : (item as any).photo_reference
                            ? `/api/photo?ref=${(item as any).photo_reference}`
                            : `https://source.unsplash.com/featured/?${encodeURIComponent(item.name)}`
                        }
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      {(item as any).rating && (
                        <div className="absolute top-3 right-3 bg-yellow-500 text-black rounded-full px-3 py-1 font-bold text-sm">
                          ★ {(item as any).rating?.toFixed(1)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-sm text-slate-400">No image available</div>
                  )}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>

                    {(item as any).address && (
                      <p className="text-sm text-slate-300 mb-2"><IconPin style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6, color: 'var(--theme-accent)' }} /> {(item as any).address}</p>
                    )}

                    {(item as any).phone && (
                      <p className="text-sm text-slate-300 mb-1">📞 {(item as any).phone}</p>
                    )}

                    {(item as any).website && (
                      <p className="text-sm text-blue-400 mb-3">
                        🌐 <a href={(item as any).website} target="_blank" rel="noopener noreferrer" className="underline">Visit Website</a>
                      </p>
                    )}

                    {(item as any).baseNightly ? (
                      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-3 mb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">
                              {(item as any).priceSource === 'booking' ? '✓ Real Price' : '📊 Estimated Price'}
                            </p>
                            <p className="text-lg font-bold text-slate-100">
                              ₹{((item as any).baseNightly || 0).toLocaleString("en-IN")} <span className="text-sm text-slate-300">/ night</span>
                            </p>
                            <p className="text-sm text-slate-300 mt-1">
                              <IconCalendar style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6, color: 'var(--theme-accent)' }} /> {days} days / {nights} night{nights > 1 ? 's' : ''}
                            </p>
                            <p className="text-sm text-slate-300 mt-1">
                              💰 ₹{(((item as any).baseNightly || 0) * nights).toLocaleString("en-IN")} <span className="text-xs text-slate-400">total</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/5 rounded-lg p-3 mb-3">
                        <p className="text-sm text-slate-300">Price on request</p>
                      </div>
                    )}

                    <a
                      href={getBookingLink(item as Place)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors text-center mb-2"
                    >
                      🔗 Check Live Price
                    </a>

                    <button
                      onClick={() => onSelectPlace(item)}
                      className="w-full px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      Select this {tab === "rooms" ? "room" : tab === "airbnb" ? "Airbnb" : "hotel"}
                    </button>
                  </div>
                </div>
              ))
            )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
