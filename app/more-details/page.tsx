"use client";

export const dynamic = 'force-dynamic';

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AnimatedHeroBackground from "@/components/AnimatedHeroBackground";
import { FaArrowLeft, FaStar, FaMapMarkerAlt, FaPhone, FaGlobe, FaClock, FaCamera, FaUsers, FaTag } from "react-icons/fa";
import { FaCalendarDays } from "react-icons/fa6";

interface PlaceDetails {
  name: string;
  rating?: number | string;
  reviews?: number | string;
  photo_reference?: string | null;
  imageUrl?: string;
  description?: string;
  address?: string;
  location?: { lat: number; lng: number } | null;
  mapLink?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  price?: string;
  types?: string[];
  bestTime?: string;
  whyChosen?: string;
  history?: string;
  touristGuide?: string;
  menu?: string;
  photos?: string[];
}

function PlaceDetailsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [place, setPlace] = useState<PlaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    const loadPlaceDetails = async () => {
      try {
        // First try to get from sessionStorage
        const placeData = sessionStorage.getItem("selectedPlaceDetails");
        if (placeData) {
          const parsed = JSON.parse(placeData);
          setPlace(parsed);
          
          // Try to enrich with additional data if we have a name
          if (parsed.name) {
            try {
              const response = await fetch(`/api/places?destination=${parsed.name}`);
              if (response.ok) {
                const data = await response.json();
                const enrichedPlace = data[0];
                if (enrichedPlace) {
                  setPlace(prev => ({
                    ...prev,
                    ...enrichedPlace,
                    name: parsed.name,
                  }));
                }
              }
            } catch (enrichError) {
              console.log("Could not enrich place data, using stored data");
            }
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading place details:", error);
        setIsLoading(false);
      }
    };

    loadPlaceDetails();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1F3A] text-[#F8F9FB]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="flex min-h-screen flex-col bg-[#0B1F3A] text-[#F8F9FB]">
        <AnimatedHeroBackground />
        <div className="relative z-20 flex flex-col min-h-screen items-center justify-center text-center">
          <h1 className="text-3xl font-bold mb-4">No Place Details Found</h1>
          <p className="text-gray-300 mb-8">Please go back and select a place first.</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <FaArrowLeft /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0B1F3A] text-[#F8F9FB] relative overflow-hidden">
      <AnimatedHeroBackground />

      <div className="relative z-20 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex h-20 items-center justify-between border-b border-blue-500/20 px-6 lg:px-12 backdrop-blur-md bg-[#0B1F3A]/60">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors font-semibold cursor-pointer"
          >
            <FaArrowLeft className="w-5 h-5 theme-accent" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-blue-400">More Info</h1>
          <div className="w-16"></div>
        </header>

        {/* Main Content */}
        <main className="flex-1 py-8 px-6 lg:px-12 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8">

            {/* 1. Place Name Heading */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">{place.name}</h1>
              <div className="w-24 h-1 bg-blue-400 mx-auto rounded-full"></div>
            </div>

            {/* 2. Why We Choose This Place */}
            <section className="bg-white/5 backdrop-blur-md border border-blue-500/30 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-blue-400 mb-6 flex items-center gap-3">
                <FaStar className="w-8 h-8 theme-accent" />
                Why We Choose This Place
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                {place.whyChosen || "This destination was selected based on your travel preferences, including the perfect blend of culture, adventure, and relaxation. Our AI-powered recommendation system analyzed your trip requirements to ensure this location matches your interests and provides the best possible experience for your journey."}
              </p>
            </section>

            {/* 3. Location */}
            <section className="bg-white/5 backdrop-blur-md border border-blue-500/30 rounded-2xl p-8">
                <h2 className="text-3xl font-bold text-blue-400 mb-6 flex items-center gap-3">
                <FaMapMarkerAlt className="w-8 h-8 theme-accent" />
                Location
              </h2>
              <div className="space-y-4">
                {place.address && (
                  <p className="text-gray-300 text-lg">{place.address}</p>
                )}
                {place.mapLink && (
                  <div className="flex gap-4">
                      <a
                      href={place.mapLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all hover:shadow-lg"
                    >
                      <FaMapMarkerAlt className="w-5 h-5 theme-accent" />
                      View on Google Maps
                    </a>
                  </div>
                )}
              </div>
            </section>

            {/* 4. Ratings */}
            <section className="bg-white/5 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-yellow-400 mb-6 flex items-center gap-3">
                <FaStar className="w-8 h-8 theme-accent" />
                Ratings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {place.rating && (
                  <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                      <FaStar className="w-6 h-6 theme-accent" />
                      <span className="text-4xl font-bold text-yellow-400">{place.rating}</span>
                    </div>
                    <p className="text-gray-300">Overall Rating</p>
                  </div>
                )}
                {place.reviews && (
                  <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                      <FaUsers className="w-6 h-6 theme-accent" />
                      <span className="text-4xl font-bold text-blue-400">{place.reviews}</span>
                    </div>
                    <p className="text-gray-300">Total Reviews</p>
                  </div>
                )}
                {place.price && (
                  <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                      <FaTag className="w-6 h-6 theme-accent" />
                      <span className="text-4xl font-bold text-green-400">{place.price}</span>
                    </div>
                    <p className="text-gray-300">Price Range</p>
                  </div>
                )}
              </div>
            </section>

            {/* 5. Information */}
            <section className="bg-white/5 backdrop-blur-md border border-blue-500/30 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-blue-400 mb-6 flex items-center gap-3">
                <FaCamera className="w-8 h-8" />
                Information
              </h2>
              <div className="space-y-6">
                {place.description && (
                  <p className="text-gray-300 leading-relaxed text-lg">{place.description}</p>
                )}

                {place.types && place.types.length > 0 && (
                  <div>
                    <h4 className="text-xl font-bold text-blue-300 mb-3">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {place.types.map((type, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-blue-500/20 border border-blue-400/50 text-blue-300 rounded-full text-sm font-semibold"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {place.openingHours && (
                  <div>
                    <h4 className="text-xl font-bold text-blue-300 mb-3">Opening Hours</h4>
                    <p className="text-gray-300 whitespace-pre-wrap text-lg">{place.openingHours}</p>
                  </div>
                )}

                {place.bestTime && (
                  <div>
                    <h4 className="text-xl font-bold text-blue-300 mb-3">Best Time to Visit</h4>
                    <p className="text-gray-300 text-lg">{place.bestTime}</p>
                  </div>
                )}
              </div>
            </section>

            {/* 6. Photos */}
            <section className="bg-white/5 backdrop-blur-md border border-blue-500/30 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-blue-400 mb-6 flex items-center gap-3">
                <FaCamera className="w-8 h-8" />
                Photos
              </h2>

              {/* Top Row - 4 Photos */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="aspect-[9/16] rounded-lg overflow-hidden bg-gray-700">
                    {place.photo_reference ? (
                      <img
                        src={`/api/photo?ref=${place.photo_reference}`}
                        alt={`${place.name} photo ${index}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-900/30 to-blue-700/30 flex items-center justify-center">
                        <FaCamera className="w-8 h-8 text-blue-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Row - 4 Photos */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[5, 6, 7, 8].map((index) => (
                  <div key={index} className="aspect-[9/16] rounded-lg overflow-hidden bg-gray-700">
                    {place.photo_reference ? (
                      <img
                        src={`/api/photo?ref=${place.photo_reference}`}
                        alt={`${place.name} photo ${index}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-900/30 to-blue-700/30 flex items-center justify-center">
                        <FaCamera className="w-8 h-8 text-blue-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* More Photos Button */}
              <div className="text-center">
                <a
                  href={place.mapLink || `https://www.google.com/maps/search/${encodeURIComponent(place.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all hover:shadow-lg"
                >
                  <FaCamera className="w-5 h-5" />
                  View More Photos on Google Maps
                </a>
              </div>
            </section>

            {/* 7. Other Info */}
            <section className="bg-white/5 backdrop-blur-md border border-blue-500/30 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-blue-400 mb-6 flex items-center gap-3">
                <FaUsers className="w-8 h-8" />
                Other Information
              </h2>

              {/* Tourist Guide for tourist places */}
              {place.types?.some(type => type.toLowerCase().includes('tourist') || type.toLowerCase().includes('attraction')) && (
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-blue-300 mb-3">Tourist Guide</h4>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {place.touristGuide || "This location offers guided tours that provide insights into local culture, history, and hidden gems. Professional guides are available in multiple languages and can customize tours based on your interests and time constraints."}
                  </p>
                </div>
              )}

              {/* Menu for hotels/restaurants */}
              {place.types?.some(type => type.toLowerCase().includes('restaurant') || type.toLowerCase().includes('hotel') || type.toLowerCase().includes('food')) && (
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-blue-300 mb-3">Menu & Dining</h4>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {place.menu || "This establishment offers a diverse menu featuring local and international cuisine. From traditional dishes to modern fusion, there's something for every palate. Dietary restrictions can be accommodated with advance notice."}
                  </p>
                </div>
              )}

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {place.phone && (
                  <div>
                    <h4 className="text-lg font-bold text-blue-300 mb-2">Phone</h4>
                    <a
                      href={`tel:${place.phone}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors text-lg font-semibold"
                    >
                      {place.phone}
                    </a>
                  </div>
                )}

                {place.website && (
                  <div>
                    <h4 className="text-lg font-bold text-blue-300 mb-2">Website</h4>
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors text-lg font-semibold break-all"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </section>

            {/* 8. History */}
            <section className="bg-white/5 backdrop-blur-md border border-blue-500/30 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-blue-400 mb-6 flex items-center gap-3">
                <FaClock className="w-8 h-8" />
                History
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                {place.history || "This location has a rich history that spans centuries, witnessing important events and cultural developments. From ancient civilizations to modern times, each era has left its mark on this place, creating a unique blend of historical significance and contemporary relevance."}
              </p>
            </section>

            {/* Back Button */}
            <div className="text-center pt-8">
              <button
                onClick={() => router.back()}
                className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all hover:shadow-lg flex items-center gap-2 mx-auto"
              >
                <FaArrowLeft className="w-5 h-5" />
                Back to Itinerary
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function PlaceDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1F3A] text-[#F8F9FB] flex items-center justify-center">Loading place details...</div>}>
      <PlaceDetailsPageContent />
    </Suspense>
  );
}
