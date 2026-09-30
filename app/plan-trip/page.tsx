/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense, useMemo, useRef } from "react";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ItineraryCard from "../../components/ItineraryCard";
import TransitInfoCard from "../../components/TransitInfoCard";
import MapView from "../../components/Map";
import VehicleForm from "../../components/VehicleForm";
import LoadingOverlay from "../../components/LoadingOverlay";
import AnimatedHeroBackground from "../../components/AnimatedHeroBackground";
import { cleanActivityDescription } from "../../lib/activityCleaner";
import { HiSparkles } from "react-icons/hi2";
import { FaMapLocationDot, FaCalendar, FaMoneyBillWave, FaClock, FaUser, FaLeaf, FaUtensils, FaFloppyDisk, FaHouse, FaPlane, FaCarSide, FaBus } from "react-icons/fa6";
import { IconCar, IconBus, IconTaxi, IconHome, IconPin, IconMoney } from "../../components/Icons";
import { MdDirectionsRun } from "react-icons/md";

type Place = {
  name: string;
  rating?: number;
  photo_reference?: string | null;
  imageUrl?: string; // Fallback image URL
  imageSource?: string; // Source of image
  location?: { lat: number; lng: number } | null;
};

function PlanTripContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vehicleMode = searchParams?.get("mode") === "vehicle";

  const [destination, setDestination] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [budget, setBudget] = useState("Moderate");
  const [startingLocation, setStartingLocation] = useState("");
  const [transportMode, setTransportMode] = useState("flight");
  const [intermediateTransport, setIntermediateTransport] = useState("personal");
  const [selectedOutboundTrain, setSelectedOutboundTrain] = useState<any>(null);
  const [selectedReturnTrain, setSelectedReturnTrain] = useState<any>(null);
  const [selectedOutboundClass, setSelectedOutboundClass] = useState<any>(null);
  const [selectedReturnClass, setSelectedReturnClass] = useState<any>(null);

  // Create current date and date 3 days from now for defaults
  const today = new Date();
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(formatDate(today));
  const [endDate, setEndDate] = useState(formatDate(threeDaysFromNow));

  const [arrivalTime, setArrivalTime] = useState("10:00");
  const [partySize, setPartySize] = useState<number>(1);
  const [tripTypes, setTripTypes] = useState<string[]>(["Leisure"]);
  const [companion, setCompanion] = useState("Solo");
  const [pace, setPace] = useState("Moderate");

  // Vehicle & driver state (used when ?mode=vehicle)
  const [vehicleType, setVehicleType] = useState("four-wheeler");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [variant, setVariant] = useState("");
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [fuel, setFuel] = useState("");
  const [lastServiceDate, setLastServiceDate] = useState("");
  const [odometer, setOdometer] = useState<string>("");

  const [drivingExperience, setDrivingExperience] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [comfortableWithLongDrives, setComfortableWithLongDrives] = useState<string | null>(null);
  const [numberOfDrivers, setNumberOfDrivers] = useState<number>(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // clamp numberOfDrivers when vehicleType changes
  useEffect(() => {
    const max = vehicleType === "two-wheeler" ? 2 : 6;
    if (numberOfDrivers > max) setNumberOfDrivers(max);
    // reset brand/model when vehicle type changes to avoid cross-contamination
    setBrand("");
    setModel("");
    setFuel("");
    setLicenseType("");
    setOdometer("");
    setDrivingExperience("");
    setComfortableWithLongDrives(null);
  }, [vehicleType]);

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  // New options
  const [dietary, setDietary] = useState("None");
  const [transitMode, setTransitMode] = useState("Any");
  const [customNotes, setCustomNotes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isTerrainLoading, setIsTerrainLoading] = useState(false);
  const [isDestinationHilly, setIsDestinationHilly] = useState<boolean | null>(null);
  const [terrainError, setTerrainError] = useState<string | null>(null);
  const terrainCacheRef = useMemo(() => new Map<string, { isHilly: boolean }>(), []);
  const autocompleteRef = useRef<any>(null);

  const { isLoaded: isMapsLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places" as any],
  });

  const [generatedDays, setGeneratedDays] = useState<number[]>([]);
  const [hotels, setHotels] = useState<Place[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Place | null>(null);
  const [selectedStayType, setSelectedStayType] = useState<"hotel" | "room" | "airbnb">("hotel");
  const [restaurants, setRestaurants] = useState<Place[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [aiPlan, setAiPlan] = useState<any>({});
  const [activeDay, setActiveDay] = useState<number>(1);
  const [hasRestoredState, setHasRestoredState] = useState(false);
  const LOCAL_STORAGE_KEY = "travel-ai-plan-trip";

  const cleanName = (name: string) => name.split("|")[0].trim();

  useEffect(() => {
    const tripId = searchParams.get("tripId");

    if (tripId) {
      setIsLoading(true);
      fetch(`/api/trips?id=${tripId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            setDestination(data.destination || "");
            setStartDate(data.startDate || formatDate(today));
            setEndDate(data.endDate || formatDate(threeDaysFromNow));
            setBudget(data.budget || "Moderate");
            setArrivalTime(data.arrival || "10:00");
            setTripTypes(data.tripType ? data.tripType.split(", ") : ["Leisure"]);
            setCompanion(data.companion || "Solo");
            setPace(data.pace || "Moderate");
            setDietary(data.dietary || "None");
            setTransitMode(data.transitMode || "Any");
            setCustomNotes(data.customNotes || "");
            setStartingLocation(data.startingLocation || "");
            setTransportMode(data.transportMode || "flight");
            setIntermediateTransport(data.intermediateTransport || "personal");
            setHotels(data.hotels || []);
            setSelectedHotel(data.selectedHotel || null);
            setSelectedStayType(data.selectedStayType || "hotel");
            setAiPlan(data.aiPlan || {});
            const totalDays = data.days || Object.keys(data.aiPlan || {}).length;
            setGeneratedDays(Array.from({ length: totalDays }, (_, i) => i + 1));
          }
        })
        .catch(err => {
          console.error("Error loading trip:", err);
          setError("Failed to load saved trip.");
        })
        .finally(() => setIsLoading(false));
    } else if (!hasRestoredState) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setDestination(parsed.destination || "");
          setStartDate(parsed.startDate || formatDate(today));
          setEndDate(parsed.endDate || formatDate(threeDaysFromNow));
          setBudget(parsed.budget || "Moderate");
          setArrivalTime(parsed.arrivalTime || "10:00");
          setTripTypes(parsed.tripTypes || ["Leisure"]);
          setCompanion(parsed.companion || "Solo");
          setPace(parsed.pace || "Moderate");
          setDietary(parsed.dietary || "None");
          setTransitMode(parsed.transitMode || "Any");
          setCustomNotes(parsed.customNotes || "");
          setStartingLocation(parsed.startingLocation || "");
          setTransportMode(parsed.transportMode || "flight");
          setIntermediateTransport(parsed.intermediateTransport || "personal");
          setHotels(parsed.hotels || []);
          setRestaurants(parsed.restaurants || []);
          setPlaces(parsed.places || []);
          setSelectedHotel(parsed.selectedHotel || null);
          setSelectedStayType(parsed.selectedStayType || "hotel");
          setAiPlan(parsed.aiPlan || {});
          setGeneratedDays(parsed.generatedDays || []);
          setActiveDay(parsed.activeDay || 1);
        } catch (err) {
          console.warn("Could not parse saved trip state", err);
        }
      }
      setHasRestoredState(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, hasRestoredState]);

  useEffect(() => {
    // If user picked a hotel in the hotel-search flow, apply it now and re-generate the itinerary.
    const rawHotel = localStorage.getItem("travel-ai-selected-hotel");
    if (rawHotel) {
      try {
        const parsedHotel = JSON.parse(rawHotel);
        if (parsedHotel && parsedHotel.name) {
          setSelectedHotel(parsedHotel);
          setSelectedStayType(parsedHotel.stayType || "hotel");
          setHotels((prev) => [parsedHotel, ...prev.filter((h: Place) => h.name !== parsedHotel.name)]);
          generateItinerary(parsedHotel);
        }
      } catch (err) {
        console.error("Failed to parse selected hotel", err);
      } finally {
        localStorage.removeItem("travel-ai-selected-hotel");
      }
    }
  }, []);

  // Run terrain check only when a place is selected (use selectedPlace coordinates)
  useEffect(() => {
    let cancelled = false;

    if (!selectedPlace || !selectedPlace.geometry?.location) {
      setIsDestinationHilly(null);
      setTerrainError(null);
      setIsTerrainLoading(false);
      return;
    }

    const lat = selectedPlace.geometry.location.lat();
    const lng = selectedPlace.geometry.location.lng();
    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;

    const cached = terrainCacheRef.get(key);
    if (cached) {
      setIsDestinationHilly(cached.isHilly);
      setIsTerrainLoading(false);
      setTerrainError(null);
      return;
    }

    setIsTerrainLoading(true);
    setTerrainError(null);

    (async () => {
      try {
        const res = await fetch(`/api/terrain?lat=${lat}&lng=${lng}`);
        const data = await res.json();
        if (cancelled) return;
        const isHilly = !!data?.isHilly;
        terrainCacheRef.set(key, { isHilly });
        setIsDestinationHilly(isHilly);
      } catch (err: any) {
        console.error("Terrain lookup error", err);
        if (cancelled) return;
        setIsDestinationHilly(false);
        setTerrainError(err?.message || "terrain-failed");
      } finally {
        if (!cancelled) setIsTerrainLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedPlace, terrainCacheRef]);

  // Clear comfortableWithLongDrives when destination is determined flat
  useEffect(() => {
    if (isDestinationHilly === false) {
      setComfortableWithLongDrives(null);
      // also clear any validation error for that field
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy.comfortableWithLongDrives;
        return copy;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDestinationHilly]);

  useEffect(() => {
    // Don't save until we restored existing state (or have a tripId from server) to avoid wiping stored itinerary on first load.
    if (!hasRestoredState && !searchParams.get("tripId")) {
      return;
    }

    const dataToStore = {
      destination,
      startDate,
      endDate,
      arrivalTime,
      tripTypes,
      companion,
      pace,
      dietary,
      transitMode,
      customNotes,
      startingLocation,
      transportMode,
      intermediateTransport,
      generatedDays,
      hotels,
      selectedHotel,
      selectedStayType,
      restaurants,
      places,
      aiPlan,
      activeDay,
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
  }, [
    destination,
    startDate,
    endDate,
    arrivalTime,
    tripTypes,
    companion,
    pace,
    dietary,
    transitMode,
    customNotes,
    startingLocation,
    transportMode,
    intermediateTransport,
    generatedDays,
    hotels,
    restaurants,
    places,
    aiPlan,
    activeDay,
    hasRestoredState,
    searchParams,
  ]);

  const saveTrip = async () => {
    if (!destination || generatedDays.length === 0 || Object.keys(aiPlan).length === 0) return;
    
    setIsSaving(true);
    try {
      const tripData = {
        destination,
        startDate,
        endDate,
        arrival: arrivalTime,
        days: generatedDays.length,
        tripType: tripTypes.join(", "),
        companion,
        pace,
        budget,
        dietary,
        transitMode,
        customNotes,
        startingLocation,
        transportMode,
        intermediateTransport,
        hotels,
        selectedHotel,
        selectedStayType,
        aiPlan
      };

      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripData),
      });

      if (!res.ok) throw new Error("Failed to save");
      
      const data = await res.json();
      router.replace(`/plan-trip?tripId=${data.id}`);
      alert("Trip saved successfully! You can share this URL.");
    } catch (err) {
      console.error(err);
      alert("Failed to save trip.");
    } finally {
      setIsSaving(false);
    }
  };

  const getMapLocations = useMemo(() => {
    if (!aiPlan[`day${activeDay}`]) return [];
    
    const locations: any[] = [];
    
    const hotelForMap = selectedHotel || (hotels.length > 0 ? hotels[0] : null);
    if (activeDay === 1 && hotelForMap?.location) {
      locations.push({
        lat: hotelForMap.location.lat,
        lng: hotelForMap.location.lng,
        name: hotelForMap.name
      });
    }

    const dayPlan = aiPlan[`day${activeDay}`] || [];
    
    dayPlan.forEach((item: any) => {
      const match = [...places, ...restaurants].find(p => 
        item.activity.toLowerCase().includes(p.name.toLowerCase()) || 
        p.name.toLowerCase().includes(item.activity.toLowerCase())
      );
      
      if (match && match.location) {
        locations.push({
          lat: match.location.lat,
          lng: match.location.lng,
          name: match.name
        });
      }
    });

    return locations;
  }, [aiPlan, activeDay, hotels, places, restaurants]);

  const handleEditActivity = async (dayString: string, itemIdx: number, customPrompt: string) => {
    try {
      const dayPlan = aiPlan[dayString];
      const itemToEdit = dayPlan[itemIdx];

      // Optimistic or loading could be added here
      
      const res = await fetch("/api/edit-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentActivity: itemToEdit,
          time: itemToEdit.time,
          day: dayString,
          destination,
          customPrompt,
          transitMode: transitMode
        })
      });

      if (!res.ok) throw new Error("Failed to edit activity");
      const newActivity = await res.json();

      setAiPlan((prevStr: any) => {
        const copy = JSON.parse(JSON.stringify(prevStr));
        copy[dayString][itemIdx] = newActivity;
        return copy;
      });

    } catch (err) {
      console.error(err);
      alert("Failed to edit activity. Please try again.");
    }
  };

  const [isEnrichingImages, setIsEnrichingImages] = useState(false);

  const generateActivityDescription = (activityStr: string, match?: any): string => {
    // Generate a meaningful 1-2 sentence description
    const actLower = activityStr.toLowerCase();
    
    if (match) {
      // If we have a matched place/restaurant/hotel
      if (actLower.includes('restaurant') || actLower.includes('dine') || actLower.includes('eat') || actLower.includes('lunch') || actLower.includes('dinner')) {
        return `Experience authentic cuisine at ${match.name}. Enjoy delicious meals and local flavors with great ambiance and service.`;
      }
      if (actLower.includes('hotel') || actLower.includes('stay') || actLower.includes('check')) {
        return `Stay at ${match.name} for a comfortable experience. Relax and rejuvenate before continuing your adventure.`;
      }
      return `Explore and experience ${match.name}. Discover attractions and immerse yourself in the local culture.`;
    }
    
    // Generic descriptions for activities
    if (actLower.includes('arrive')) {
      return `Arrive at your destination and get settled. Check in at your hotel and explore the local surroundings.`;
    }
    if (actLower.includes('breakfast') || actLower.includes('morning meal')) {
      return `Start your day with a delicious breakfast. Enjoy local specialties and traditional dishes.`;
    }
    if (actLower.includes('lunch') || actLower.includes('afternoon meal')) {
      return `Enjoy a satisfying lunch break. Taste local cuisine at a popular restaurant.`;
    }
    if (actLower.includes('dinner') || actLower.includes('evening meal')) {
      return `Experience a memorable dinner experience. Savor authentic flavors and fine dining.`;
    }
    if (actLower.includes('trek') || actLower.includes('hiking') || actLower.includes('walk')) {
      return `Go on an adventurous trek through beautiful landscapes. Experience nature and enjoy physical activity.`;
    }
    if (actLower.includes('visit') || actLower.includes('explore')) {
      return `Visit and explore this remarkable destination. Discover hidden gems and local attractions.`;
    }
    if (actLower.includes('shopping')) {
      return `Explore local markets and shops. Find unique souvenirs and authentic local products.`;
    }
    if (actLower.includes('relax') || actLower.includes('rest')) {
      return `Take time to relax and unwind. Enjoy your downtime at a peaceful location.`;
    }
    
    return `Experience this activity and create lasting memories. Enjoy the moment and soak in the experience.`;
  };

  const enrichActivity = (item: any) => {
    const activityStr = item.activity || "";
    // Clean the description to remove transit information
    const cleanedDescription = cleanActivityDescription(item.description || "");
    
    // Match against places, restaurants, AND hotels
    const match = [...places, ...restaurants, ...hotels].find(p => 
      activityStr.toLowerCase().includes(p.name.toLowerCase()) || 
      p.name.toLowerCase().includes(activityStr.toLowerCase())
    );
    
    const makeSlug = (text: string) =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const description = cleanedDescription || generateActivityDescription(activityStr, match);

    if (match) {
      return {
        name: activityStr,
        rating: match.rating,
        photo_reference: match.photo_reference,
        location: match.location,
        description,
        mapLink: item.mapLink,
        transit: item.transit,
        imageUrl: match.photo_reference ? `/api/photo?ref=${match.photo_reference}` : item.imageUrl,
        imageSource: match.photo_reference ? 'google-maps' : item.imageSource,
        detailSlug: makeSlug(match.name),
      };
    }

    return {
      name: activityStr,
      description,
      mapLink: item.mapLink,
      transit: item.transit,
      imageUrl: item.imageUrl,
      imageSource: item.imageSource,
      detailSlug: undefined,
    };
  };

  // Enrich hotels with images if needed
  useEffect(() => {
    const enrichHotelsWithImages = async () => {
      if (hotels.length === 0) return;

      // Check if hotels already have images
      if (hotels[0].imageUrl) return;

      const enrichedHotels = await Promise.all(
        hotels.map(async (hotel: any) => {
          if (hotel.photo_reference) {
            return {
              ...hotel,
              imageUrl: `/api/photo?ref=${hotel.photo_reference}`,
              imageSource: 'google-maps'
            };
          }

          // Try to fetch fallback image
          try {
            const response = await fetch(
              `/api/image-search?q=${encodeURIComponent(hotel.name)}&destination=${encodeURIComponent(destination)}`
            );
            if (response.ok) {
              const data = await response.json();
              return {
                ...hotel,
                imageUrl: data.imageUrl,
                imageSource: data.source
              };
            }
          } catch (error) {
            console.error(`Error fetching hotel image for "${hotel.name}":`, error);
          }

          return hotel;
        })
      );

      setHotels(enrichedHotels);
    };

    if (destination && hotels.length > 0) {
      enrichHotelsWithImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination]);

  // Enrich all activities with images after initial itinerary generation
  useEffect(() => {
    const enrichAllActivitiesWithImages = async () => {
      if (Object.keys(aiPlan).length === 0 || isEnrichingImages) return;

      // Check if already enriched (has imageUrl in any activity)
      const firstActivity = aiPlan[Object.keys(aiPlan)[0]]?.[0];
      if (firstActivity?.imageUrl) return;

      setIsEnrichingImages(true);
      const enrichedPlan: any = {};
      
      try {
        for (const dayKey of Object.keys(aiPlan)) {
          enrichedPlan[dayKey] = await Promise.all(
            aiPlan[dayKey].map(async (item: any) => {
              const activityStr = item.activity || "";
              const match = [...places, ...restaurants, ...hotels].find((p: any) =>
                activityStr.toLowerCase().includes(p.name.toLowerCase()) ||
                p.name.toLowerCase().includes(activityStr.toLowerCase())
              );

              // If we have a match with photo_reference, use it
              if (match?.photo_reference) {
                return {
                  ...item,
                  photo_reference: match.photo_reference,
                  imageUrl: `/api/photo?ref=${match.photo_reference}`,
                  imageSource: 'google-maps',
                  rating: match.rating,
                  location: match.location
                };
              }

              // If we have a match but no photo, still preserve location and rating
              if (match && !match.photo_reference) {
                let imageUrl = item.imageUrl;
                let imageSource = item.imageSource;

                // Try to fetch fallback image
                if (!item.imageUrl) {
                  try {
                    const response = await fetch(
                      `/api/image-search?q=${encodeURIComponent(activityStr)}&destination=${encodeURIComponent(destination)}`
                    );
                    if (response.ok) {
                      const data = await response.json();
                      imageUrl = data.imageUrl;
                      imageSource = data.source;
                    }
                  } catch (error) {
                    console.error(`Error fetching image for "${activityStr}":`, error);
                  }
                }

                return {
                  ...item,
                  rating: match.rating,
                  location: match.location,
                  imageUrl,
                  imageSource
                };
              }

              // If no match photo, try to fetch image for the activity
              if (!item.photo_reference && !item.imageUrl) {
                try {
                  // For arrival activities, request image verification
                  const isArrival = activityStr.toLowerCase().includes('arrive in') || activityStr.toLowerCase().includes('arrive at');
                  const verifyParam = isArrival ? '&verify=true' : '';
                  const response = await fetch(
                    `/api/image-search?q=${encodeURIComponent(activityStr)}&destination=${encodeURIComponent(destination)}${verifyParam}`
                  );
                  if (response.ok) {
                    const data = await response.json();
                    return {
                      ...item,
                      imageUrl: data.imageUrl,
                      imageSource: data.source
                    };
                  }
                } catch (error) {
                  console.error(`Error fetching image for "${activityStr}":`, error);
                }
              }

              return item;
            })
          );
        }

        setAiPlan(enrichedPlan);
      } finally {
        setIsEnrichingImages(false);
      }
    };

    // Only run enrichment for newly generated plans
    if (Object.keys(aiPlan).length > 0 && !isEnrichingImages) {
      enrichAllActivitiesWithImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, isGenerating, isEnrichingImages]);

  const calculateDays = () => {
    // Activity days are inclusive of both start and end dates
    // E.g., 16/03 to 18/03 = 3 days (16, 17, 18)
    // Nights are the nights in between (16th night, 17th night) = 2 nights
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const days = nights === 0 ? 1 : nights + 1; // Activity days include both start and end date
    return days;
  };

  const toggleInterest = (type: string) => {
    setTripTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const chooseHotelAndReplan = async (hotelName: string) => {
    const chosen = hotels.find((h) => h.name === hotelName);
    if (!chosen) return;
    setSelectedHotel(chosen);
    await generateItinerary(chosen);
  };

  const handleViewDetails = (place: string | any) => {
    const placeObj = typeof place === 'string' ? { name: place } : place;
    sessionStorage.setItem("selectedPlaceDetails", JSON.stringify(placeObj));
    router.push("/more-details");
  };

  const generateItinerary = async (hotelOverride?: Place | null) => {
    const totalDays = calculateDays();
    // Validation
    const errors: Record<string, string> = {};
    if (!destination) errors.destination = "This field is required";
    if (!startDate) errors.startDate = "This field is required";
    if (!endDate) errors.endDate = "This field is required";
    if (new Date(endDate) <= new Date(startDate)) errors.endDate = "End date must be after start date";
    if (!partySize || partySize < 1) errors.partySize = "Enter number of people traveling";

    if (vehicleMode) {
      if (!vehicleType) errors.vehicleType = "Select vehicle type";
      if (!brand) errors.brand = "This field is required";
      if (!model) errors.model = "This field is required";
      if (!fuel) errors.fuel = "This field is required";
      if (!year) errors.year = "This field is required";
      if (!lastServiceDate) errors.lastServiceDate = "This field is required";
      const odoNum = Number(odometer);
      if (!odometer || isNaN(odoNum) || odoNum <= 0) errors.odometer = "Enter a valid odometer reading";
      const expNum = Number(drivingExperience);
      if (!drivingExperience || isNaN(expNum) || expNum < 0) errors.drivingExperience = "This field is required";
      if (!licenseType) errors.licenseType = "This field is required";
      // Only require hill-drive choice when destination is classified as hilly
      if (isDestinationHilly && !comfortableWithLongDrives) errors.comfortableWithLongDrives = "Please indicate Yes or No";
      if (!startingLocation) errors.startingLocation = "This field is required";
    } else {
      if (!companion) errors.companion = "This field is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // mark and scroll to first invalid
      setTimeout(() => {
        const el = document.querySelector('[data-invalid="true"]');
        if (el && typeof (el as HTMLElement).scrollIntoView === 'function') {
          (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      return;
    }

    if (totalDays <= 0) {
      setError(
        "Please fill in the destination and ensure end date is after start date.",
      );
      return;
    }

    setIsGenerating(true);
    setIsLoading(true);
    setError("");
    setGeneratedDays(Array.from({ length: totalDays }, (_, i) => i + 1));
    setAiPlan({});
    setHotels([]);

    try {
      // Fetch top options from APIs
      const [placesRes, hotelsRes, foodRes] = await Promise.all([
        fetch(`/api/places?destination=${destination}`),
        fetch(`/api/hotels?destination=${destination}`),
        fetch(`/api/restaurants?destination=${destination}`),
      ]);

      console.log("API Response statuses:", {
        places: placesRes.status,
        hotels: hotelsRes.status,
        restaurants: foodRes.status,
      });

      const [placesData, hotelsData, foodData] = await Promise.all([
        placesRes.ok ? placesRes.json() : [],
        hotelsRes.ok ? hotelsRes.json() : [],
        foodRes.ok ? foodRes.json() : [],
      ]);

      console.log("Data fetched from APIs:", {
        placesCount: Array.isArray(placesData) ? placesData.length : 0,
        hotelsCount: Array.isArray(hotelsData) ? hotelsData.length : 0,
        restaurantsCount: Array.isArray(foodData) ? foodData.length : 0,
        firstPlace: placesData?.[0],
        firstHotel: hotelsData?.[0],
        firstRestaurant: foodData?.[0],
      });

      // Pick top-rated options
      const topPlaces = (placesData || [])
        .sort((a: Place, b: Place) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10);
      const topRestaurants = (foodData || [])
        .sort((a: Place, b: Place) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10);
      const topHotels = (hotelsData || [])
        .sort((a: Place, b: Place) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 5);

      setPlaces(topPlaces);
      setHotels(topHotels);
      setRestaurants(topRestaurants);

      // Call LLM API
      const preferredHotel = hotelOverride || selectedHotel || topHotels[0] || null;
      if (preferredHotel) setSelectedHotel(preferredHotel);

      const aiRes = await fetch("/api/ai-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          arrival: arrivalTime,
          days: totalDays,
          tripType: tripTypes.join(", "),
          companion,
          pace,
          budget,
          dietary,
          transitMode,
          partySize,
          customNotes,
          vehicle: vehicleMode
            ? {
                vehicleType,
                brand,
                model,
                variant,
                year,
                fuel,
                lastServiceDate,
                odometer: odometer ? Number(odometer) : null,
              }
            : undefined,
          driver: vehicleMode
            ? {
                drivingExperience: drivingExperience ? Number(drivingExperience) : null,
                licenseType,
                comfortableWithLongDrives: comfortableWithLongDrives === 'yes',
                numberOfDrivers,
              }
            : undefined,
          places: topPlaces,
          restaurants: topRestaurants,
          hotels: topHotels,
          selectedHotel: preferredHotel,
          selectedStayType,
          ...(vehicleMode ? { vehicle: { vehicleType, brand, model, variant, year, fuel, lastServiceDate, odometer }, driver: { drivingExperience, licenseType, comfortableWithLongDrives, numberOfDrivers } } : {}),
        }),
      });

      if (!aiRes.ok) throw new Error("Failed to generate itinerary");

      const llmPlan = await aiRes.json();
      setAiPlan(llmPlan);
    } catch (err) {
      console.error("Error generating itinerary:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate itinerary. Please try again.";
      // Check if it's a quota/rate limit error and provide helpful guidance
      if (errorMessage.includes("capacity") || errorMessage.includes("quota") || errorMessage.includes("rate limit")) {
        setError(`${errorMessage} Using our smart template system to create your itinerary instead.`);
        // Still try to generate with fallback
        setTimeout(() => {
          setError(""); // Clear error after showing fallback message
        }, 3000);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const canGenerate = (() => {
    if (isLoading) return false;
    if (!destination || !startDate || !endDate) return false;
    if (!partySize || partySize < 1) return false;
    if (vehicleMode) {
      const odoNum = Number(odometer);
      const expNum = Number(drivingExperience);
      // If destination is hilly, comfortableWithLongDrives must be selected; if unknown/null treat as optional to avoid blocking
      const hillOk = isDestinationHilly ? !!comfortableWithLongDrives : true;
      return !!(
        vehicleType && brand && model && fuel && year && lastServiceDate && !isNaN(odoNum) && odoNum > 0 && drivingExperience !== "" && !isNaN(expNum) && licenseType && hillOk
      );
    }
    return !!companion;
  })();

  return (
    <div className="min-h-screen bg-[#0B1F3A] text-[#F8F9FB] font-sans relative overflow-hidden">
      <AnimatedHeroBackground />
      <LoadingOverlay isOpen={isGenerating} destination={destination} />
      
      {/* Header */}
      <header className="relative z-20 border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/10"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3 font-serif">
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
              <span className="text-lg text-[#F8F9FB] font-light tracking-wider">Trip</span>
              <span className="text-lg text-[#D4AF37] font-semibold">Planner</span>
            </div>
          </div>
          <div className="w-16"></div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto relative z-10 p-6 md:p-12">
        <h1 className="text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#E8C547] to-[#D4AF37]">
            Design Your Perfect Trip
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">Let AI create a personalized itinerary tailored to your style</p>

        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-10 shadow-2xl mb-12 relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#D4AF37]/20 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#D4AF37]/20 rounded-full filter blur-3xl"></div>
          
          <div className="relative z-10">
          {error && (
            <div className="mb-6 p-4 bg-[#D4AF37]/20 text-[#D4AF37] rounded-xl border border-[#D4AF37]/50 backdrop-blur">
              {error}
            </div>
          )}

          {searchParams?.get("mode") === "vehicle" && (
            <div className="space-y-6 md:col-span-2">
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#E8C547] uppercase tracking-wider drop-shadow-lg">
                Vehicle Details
              </h3>
              <VehicleForm
                vehicleType={vehicleType}
                setVehicleType={setVehicleType}
                brand={brand}
                setBrand={setBrand}
                model={model}
                setModel={setModel}
                variant={variant}
                setVariant={setVariant}
                year={year}
                setYear={setYear}
                fuel={fuel}
                setFuel={setFuel}
                lastServiceDate={lastServiceDate}
                setLastServiceDate={setLastServiceDate}
                odometer={odometer}
                setOdometer={setOdometer}
                drivingExperience={drivingExperience}
                setDrivingExperience={setDrivingExperience}
                licenseType={licenseType}
                setLicenseType={setLicenseType}
                comfortableWithLongDrives={comfortableWithLongDrives}
                setComfortableWithLongDrives={setComfortableWithLongDrives}
                numberOfDrivers={numberOfDrivers}
                setNumberOfDrivers={setNumberOfDrivers}
                fieldErrors={fieldErrors}
                clearFieldError={clearFieldError}
                showHillDrive={!!isDestinationHilly}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 md:col-span-2">
              <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
                <FaMapLocationDot className="text-[#D4AF37]" />
                Where are you going?
                <span className="text-red-400 ml-2">*</span>
              </label>
              {isMapsLoaded ? (
                <Autocomplete
                  onLoad={(auto) => { autocompleteRef.current = auto; }}
                  onPlaceChanged={() => {
                    try {
                      const place = autocompleteRef.current.getPlace();
                      if (place?.formatted_address) setDestination(place.formatted_address);
                      else if (place?.name) setDestination(place.name);
                      setSelectedPlace(place || null);
                      clearFieldError('destination');
                    } catch (err) {
                      console.error('place changed error', err);
                    }
                  }}
                >
                  <input
                    name="destination"
                    autoComplete="off"
                    spellCheck={false}
                    aria-autocomplete="list"
                    role="combobox"
                    placeholder="e.g. Kyoto, Japan or Paris, France"
                    value={destination}
                    onChange={(e) => { setDestination(e.target.value); setSelectedPlace(null); clearFieldError('destination'); /* don't trigger terrain until place selected */ }}
                    className={`w-full p-4 rounded-xl bg-white/10 border ${fieldErrors.destination ? 'border-red-500' : 'border-white/20'} text-[#F8F9FB] placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15`}
                    data-invalid={!!fieldErrors.destination}
                  />
                </Autocomplete>
              ) : (
                  <input
                    name="destination"
                    autoComplete="off"
                    spellCheck={false}
                    aria-autocomplete="list"
                    role="combobox"
                    placeholder="e.g. Kyoto, Japan or Paris, France"
                    value={destination}
                    onChange={(e) => { setDestination(e.target.value); setSelectedPlace(null); clearFieldError('destination'); }}
                    className={`w-full p-4 rounded-xl bg-white/10 border ${fieldErrors.destination ? 'border-red-500' : 'border-white/20'} text-[#F8F9FB] placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15`}
                    data-invalid={!!fieldErrors.destination}
                  />
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
                <FaCalendar className="text-[#D4AF37]" />
                Start Date
                <span className="text-red-400 ml-2">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); clearFieldError('startDate'); }}
                className={`w-full p-4 rounded-xl bg-white/10 border ${fieldErrors.startDate ? 'border-red-500' : 'border-white/20'} text-[#F8F9FB] placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15`}
                data-invalid={!!fieldErrors.startDate}
              />
              {fieldErrors.startDate && <p className="text-red-400 text-sm mt-1">{fieldErrors.startDate}</p>}
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
                <FaCalendar className="text-orange-400" />
                End Date
                <span className="text-red-400 ml-2">*</span>
              </label>
              <input
                type="date"
                min={startDate}
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); clearFieldError('endDate'); }}
                className={`w-full p-4 rounded-xl bg-white/10 border ${fieldErrors.endDate ? 'border-red-500' : 'border-white/20'} text-[#F8F9FB] placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15`}
                data-invalid={!!fieldErrors.endDate}
              />
              {fieldErrors.endDate && <p className="text-red-400 text-sm mt-1">{fieldErrors.endDate}</p>}
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
                <FaMoneyBillWave className="text-[#D4AF37]" />
                Budget
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-[#F8F9FB] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15 appearance-none cursor-pointer"
              >
                <option value="Budget" className="bg-slate-800">Budget / Backpacker</option>
                <option value="Moderate" className="bg-slate-800">Moderate / Standard</option>
                <option value="Luxury" className="bg-slate-800">Luxury / Premium</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
                <FaClock className="text-[#D4AF37]" />
                Arrival Time
              </label>
              {!vehicleMode && (
                <input
                  type="time"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-[#F8F9FB] placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15"
                />
              )}
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
                <MdDirectionsRun className="text-[#D4AF37]" />
                Travel Pace
              </label>
              <div className="flex gap-3">
                {["Relaxed", "Moderate", "Fast-paced"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPace(p)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${
                      pace === p
                        ? "bg-gradient-to-r from-[#D4AF37] to-[#E8C547] text-[#0B1F3A] shadow-lg shadow-[#D4AF37]/30 scale-105"
                        : "bg-white/10 border border-white/20 text-gray-200 hover:bg-white/15 backdrop-blur-sm"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
                <FaUser className="text-[#D4AF37]" />
                Number of people traveling
                <span className="text-red-400 ml-2">*</span>
              </label>
              <input type="number" min={1} max={20} value={partySize} onChange={(e) => { setPartySize(Number(e.target.value) || 1); clearFieldError('partySize'); }} className={`w-40 p-4 rounded-xl bg-white/10 border ${fieldErrors.partySize ? 'border-red-500' : 'border-white/20'} text-[#F8F9FB]`} data-invalid={!!fieldErrors.partySize} />
              {fieldErrors.partySize && <p className="text-red-400 text-sm mt-1">{fieldErrors.partySize}</p>}
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
                <FaUser className="text-[#D4AF37]" />
                Who&apos;s Going?
                <span className="text-red-400 ml-2">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  "Solo",
                  "Couple",
                  "Family",
                  "Friends",
                  "Business",
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCompanion(c); clearFieldError('companion'); }}
                    className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all transform hover:scale-110 ${
                      companion === c
                        ? "bg-gradient-to-r from-[#D4AF37] to-[#E8C547] text-[#0B1F3A] shadow-lg shadow-[#D4AF37]/30 scale-110"
                        : "bg-white/10 border border-white/20 text-gray-200 hover:bg-white/15 backdrop-blur-sm"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
                <FaLeaf className="text-[#D4AF37]" />
                Primary Interests (Select multiple)
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  "Leisure",
                  "Adventure",
                  "Culture",
                  "Food & Drink",
                  "Nature",
                  "Nightlife",
                  "Shopping",
                ].map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleInterest(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 ${
                      tripTypes.includes(type)
                        ? "bg-gradient-to-r from-[#D4AF37] to-[#E8C547] text-[#0B1F3A] shadow-lg shadow-[#D4AF37]/30"
                        : "bg-white/10 border border-white/20 text-gray-200 hover:bg-white/15 backdrop-blur-sm"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 md:col-span-2 mt-8 pt-8 border-t border-white/20">
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#E8C547] uppercase tracking-wider drop-shadow-lg">
                ✨ ADDITIONAL OPTIONS
              </h3>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
                <FaUtensils className="text-[#D4AF37]" />
                Dietary Restrictions
              </label>
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-[#F8F9FB] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15 appearance-none cursor-pointer"
              >
                <option value="None" className="bg-slate-800">None</option>
                <option value="Vegetarian" className="bg-slate-800">Vegetarian</option>
                <option value="Vegan" className="bg-slate-800">Vegan</option>
                <option value="Gluten-Free" className="bg-slate-800">Gluten-Free</option>
                <option value="Halal" className="bg-slate-800">Halal</option>
                <option value="Kosher" className="bg-slate-800">Kosher</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
                <FaHouse className="text-[#D4AF37]" />
                Starting Location / Home Base
                <span className="text-red-400 ml-2">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Chandigarh, My Home, Delhi"
                value={startingLocation}
                onChange={(e) => { setStartingLocation(e.target.value); clearFieldError('startingLocation'); }}
                className={`w-full p-4 rounded-xl bg-white/10 border ${fieldErrors.startingLocation ? 'border-red-500' : 'border-white/20'} text-[#F8F9FB] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15 placeholder-gray-400`}
                data-invalid={!!fieldErrors.startingLocation}
              />
              {fieldErrors.startingLocation && <p className="text-red-400 text-sm mt-1">{fieldErrors.startingLocation}</p>}
            </div>

            {!vehicleMode && (
              <>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
                    <FaPlane className="text-[#D4AF37]" />
                    How will you reach the destination?
                  </label>
                  <select
                    value={transportMode}
                    onChange={(e) => setTransportMode(e.target.value)}
                    className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-[#F8F9FB] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15 appearance-none cursor-pointer"
                  >
                    <option value="flight" className="bg-slate-800">Flight</option>
                    <option value="train" className="bg-slate-800">Train</option>
                    <option value="bus" className="bg-slate-800">Bus</option>
                    <option value="personal" className="bg-slate-800">Personal Vehicle</option>
                    <option value="rental" className="bg-slate-800">Rental Car / Driver</option>
                  </select>
                </div>

                {["train", "bus", "flight"].includes(transportMode) && (
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
                      <FaCarSide className="text-[#D4AF37]" />
                      {transportMode === "flight" ? "How will you reach the airport?" : `How will you reach the ${transportMode === "train" ? "railway" : "bus"} station?`}
                    </label>
                    <select
                      value={intermediateTransport}
                      onChange={(e) => setIntermediateTransport(e.target.value)}
                      className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-[#F8F9FB] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15 appearance-none cursor-pointer"
                    >
                      <option value="personal" className="bg-slate-800">Personal Vehicle</option>
                      <option value="public" className="bg-slate-800">Public Transport (Bus/Metro)</option>
                      <option value="taxi" className="bg-slate-800">Taxi / Rideshare</option>
                      <option value="driver" className="bg-slate-800">Hired Driver</option>
                    </select>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-lg font-bold text-gray-200 uppercase tracking-wide">
                    <FaBus className="text-[#D4AF37]" />
                    In-destination Transit Mode
                  </label>
                  <select
                    value={transitMode}
                    onChange={(e) => setTransitMode(e.target.value)}
                    className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-[#F8F9FB] focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15 appearance-none cursor-pointer"
                  >
                    <option value="Any" className="bg-slate-800">Any / Mixed</option>
                    <option value="Public Transit" className="bg-slate-800">Public Transit (Subway/Bus)</option>
                    <option value="Walking" className="bg-slate-800">Walking / Pedestrian</option>
                    <option value="Driving / Rental Car" className="bg-slate-800">Driving / Rental Car</option>
                    <option value="Rideshare / Taxi" className="bg-slate-800">Rideshare / Taxi</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-3 md:col-span-2">
              <label className="text-lg font-bold text-gray-200 uppercase tracking-wide">
                💡 Custom Notes / Special Requests
              </label>
              <textarea
                placeholder="e.g. I hate mornings, please start days after 11am. I really want to visit the Ghibli Museum. Keep walking to a minimum."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-[#F8F9FB] placeholder-gray-400 focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15 resize-none min-h-[100px]"
              />
            </div>
          </div>

          <div className="mt-10 pt-8 flex flex-col sm:flex-row gap-4 justify-between items-center relative z-10">
            <p className="text-gray-300 text-sm">Ready to explore new destinations?</p>
            <button
              onClick={() => generateItinerary()}
              disabled={isLoading || !destination}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#E8C547] to-[#D4AF37] text-[#F8F9FB] font-bold text-lg hover:scale-105 active:scale-95 transition-all transform duration-200 disabled:opacity-50 disabled:hover:scale-100 shadow-lg hover:shadow-2xl hover:shadow-[#D4AF37]/50 w-full sm:w-auto relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#C4991D] via-[#D8B83D] to-[#C4991D] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="relative z-10">Creating Magic...</span>
                </>
              ) : (
                <span className="flex items-center gap-2 relative z-10">
                  Generate Itinerary <HiSparkles className="text-xl" />
                </span>
              )}
            </button>
          </div>
        </div>
        </div>

        {/* Results Section */}
        {generatedDays.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-12 lg:max-w-[60%]">
              <div className="flex justify-between mb-4 items-center">
                <div className="flex gap-2 bg-zinc-200 dark:bg-zinc-800 p-1 rounded-xl overflow-x-auto max-w-full">
                  {startingLocation && (
                    <button
                      onClick={() => setActiveDay(-1)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                        activeDay === -1 ? 'bg-white dark:bg-zinc-700 text-[#D4AF37] dark:text-[#D4AF37] shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700/50'
                      }`}
                      title="Journey to destination"
                    >
                      🚀 Journey →
                    </button>
                  )}
                  {generatedDays.map(d => (
                    <button
                      key={d}
                      onClick={() => setActiveDay(d)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                        activeDay === d ? 'bg-white dark:bg-zinc-700 text-[#D4AF37] dark:text-[#D4AF37] shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700/50'
                      }`}
                    >
                      Day {d}
                    </button>
                  ))}
                  {startingLocation && (
                    <button
                      onClick={() => setActiveDay(-2)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                        activeDay === -2 ? 'bg-white dark:bg-zinc-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700/50'
                      }`}
                      title="Journey back home"
                    >
                      ← Return 🏠
                    </button>
                  )}
                </div>
                <button
                  onClick={saveTrip}
                  disabled={isSaving || Object.keys(aiPlan).length === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-green-600 text-[#F8F9FB] font-bold hover:bg-green-500 transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : <><FaFloppyDisk /> Save</>}
                </button>
              </div>

              {/* Journey to Destination */}
              {activeDay === -1 && startingLocation && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-3xl p-6 md:p-10 shadow-sm border border-green-200 dark:border-green-900/30 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-green-500 rounded-l-3xl"></div>
                  <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-[#D4AF37] text-xl">
                      🚀
                    </span>
                    Complete Journey to {destination}
                  </h2>
                  
                  <div className="space-y-6">
                    {/* LEG 1: Home to Station/Airport */}
                    {["train", "bus", "flight"].includes(transportMode) && (
                      <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border-l-4 border-green-500">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-3xl">
                            {intermediateTransport === "personal" && <IconCar style={{ color: 'var(--theme-accent)' }} />}
                            {intermediateTransport === "public" && <IconBus style={{ color: 'var(--theme-accent)' }} />}
                            {intermediateTransport === "taxi" && <IconTaxi style={{ color: 'var(--theme-accent)' }} />}
                            {intermediateTransport === "driver" && <IconCar style={{ color: 'var(--theme-accent)' }} />}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-[#F8F9FB] mb-1">
                              Leg 1: {startingLocation} → {transportMode === "flight" ? "Airport" : transportMode === "train" ? "Railway Station" : "Bus Station"}
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                              {intermediateTransport === "personal" && "Using your personal vehicle"}
                              {intermediateTransport === "public" && "Using public transport (Metro/Bus)"}
                              {intermediateTransport === "taxi" && "Using ride-sharing services (Uber, Ola, Rapido)"}
                              {intermediateTransport === "driver" && "Using hired cab/driver service"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">⏱️ Duration</p>
                            <p className="text-lg font-bold text-green-600 dark:text-[#D4AF37]">
                              {intermediateTransport === "personal" && "35-45 min"}
                              {intermediateTransport === "public" && "50-70 min"}
                              {intermediateTransport === "taxi" && "40-50 min"}
                              {intermediateTransport === "driver" && "40-45 min"}
                            </p>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1"><IconPin style={{ display: 'inline-block', verticalAlign: 'middle', color: 'var(--theme-accent)' }} /> Distance</p>
                            <p className="text-lg font-bold text-green-600 dark:text-[#D4AF37]">
                              {intermediateTransport === "personal" && "25-35 km"}
                              {intermediateTransport === "public" && "20-30 km"}
                              {intermediateTransport === "taxi" && "25-35 km"}
                              {intermediateTransport === "driver" && "25-35 km"}
                            </p>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">💰 Cost</p>
                            <p className="text-lg font-bold text-green-600 dark:text-[#D4AF37]">
                              {intermediateTransport === "personal" && "₹200-300"}
                              {intermediateTransport === "public" && "₹50-100"}
                              {intermediateTransport === "taxi" && "₹300-500"}
                              {intermediateTransport === "driver" && "₹600-800"}
                            </p>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">🛣️ Route</p>
                            <p className="text-sm font-bold text-green-600 dark:text-[#D4AF37]">
                              {transportMode === "flight" ? "Main Airport" : "Central Station"}
                            </p>
                          </div>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-200 dark:border-amber-900/30 text-sm text-zinc-700 dark:text-zinc-300">
                          <strong>📱 Services:</strong> {intermediateTransport === "taxi" && "Uber, Ola, Rapido, or local taxi services"}{intermediateTransport === "personal" && "Your own vehicle - ensure parking availability at station"}{intermediateTransport === "public" && "Metro/Local buses - check routes beforehand"}{intermediateTransport === "driver" && "Pre-book driver service - confirm 1 day before"}
                        </div>
                      </div>
                    )}

                    {/* LEG 2: Station/Airport to Destination */}
                    {["train", "bus"].includes(transportMode) && (
                      <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border-l-4 border-blue-500">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-3xl">
                            {transportMode === "train" && "🚂"}
                            {transportMode === "bus" && "🚌"}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-[#F8F9FB] mb-1">
                              Leg 2: {transportMode === "train" ? "Railway Station" : "Bus Station"} → {destination}
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                              {transportMode === "train" && "Find and book train services"}
                              {transportMode === "bus" && "Find and book bus services"}
                            </p>
                          </div>
                        </div>
                        
                        {/* Selected Train Summary */}
                        {selectedOutboundTrain && selectedOutboundClass && transportMode === "train" && (
                          <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-900/30 mb-4">
                            <h4 className="font-bold text-green-900 dark:text-green-100 mb-2">✓ Selected Outbound Train</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              <div>
                                <p className="text-xs text-green-700 dark:text-green-300 font-semibold">Train</p>
                                <p className="font-bold text-green-900 dark:text-green-100">{selectedOutboundTrain.trainName}</p>
                              </div>
                              <div>
                                <p className="text-xs text-green-700 dark:text-green-300 font-semibold">Departure</p>
                                <p className="font-bold text-green-900 dark:text-green-100">{selectedOutboundTrain.departureTime}</p>
                              </div>
                              <div>
                                <p className="text-xs text-green-700 dark:text-green-300 font-semibold">Class</p>
                                <p className="font-bold text-green-900 dark:text-green-100">{selectedOutboundClass.name}</p>
                              </div>
                              <div>
                                <p className="text-xs text-green-700 dark:text-green-300 font-semibold">Price</p>
                                <p className="font-bold text-green-900 dark:text-green-100">₹{selectedOutboundClass.price}</p>
                              </div>
                            </div>
                            <a
                              href="https://www.irctc.co.in/nget/booking/search"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-block bg-green-600 hover:bg-green-700 text-[#F8F9FB] px-4 py-2 rounded font-semibold text-sm transition-colors"
                            >
                              Book on IRCTC →
                            </a>
                          </div>
                        )}

                        {/* Fallback for Bus or when no trains selected */}
                        {(transportMode === "bus" || !selectedOutboundTrain) && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-900/30">
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">⏱️ Duration</p>
                              <p className="text-lg font-bold text-blue-600 dark:text-[#D4AF37]">
                                {transportMode === "train" && "6-14 hrs"}
                                {transportMode === "bus" && "8-16 hrs"}
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Varies by service</p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-900/30">
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">📍 Distance</p>
                              <p className="text-lg font-bold text-blue-600 dark:text-[#D4AF37]">
                                ~400-600 km
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Approximate</p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-900/30">
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">💰 Cost</p>
                              <p className="text-lg font-bold text-blue-600 dark:text-[#D4AF37]">
                                {transportMode === "train" && "₹800-2500"}
                                {transportMode === "bus" && "₹600-1500"}
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Class dependent</p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-900/30">
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">🎫 Booking</p>
                              <p className="text-sm font-bold text-blue-600 dark:text-[#D4AF37]">
                                {transportMode === "train" && "IRCTC"}
                                {transportMode === "bus" && "Redbus/MakemyTrip"}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-200 dark:border-blue-900/30 text-sm text-zinc-700 dark:text-zinc-300 mb-4">
                          <strong>📋 Options:</strong> {transportMode === "train" && "AC 1st, AC 2nd, AC 3rd, Sleeper classes available - Book early for better fares"}{transportMode === "bus" && "AC/Non-AC, Sleeper, Semi-sleeper options - Compare operators for comfort"}
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-200 dark:border-green-900/30 text-sm text-zinc-700 dark:text-zinc-300">
                          <strong>🚕 From Station to Hotel:</strong> On arrival at {destination}, use local taxi/auto-rickshaw/Uber to reach your hotel. Expected: ₹300-600 and 20-40 minutes depending on traffic.
                        </div>
                      </div>
                    )}

                    {/* LEG 2: Flight */}
                    {transportMode === "flight" && (
                      <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border-l-4 border-blue-500">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-3xl">✈️</div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-[#F8F9FB] mb-1">
                              Leg 2: Airport → {destination}
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                              Air travel to your destination
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">✈️ Flight Time</p>
                            <p className="text-lg font-bold text-blue-600 dark:text-[#D4AF37]">
                              3-4.5 hrs
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Flight only</p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">📍 Distance</p>
                            <p className="text-lg font-bold text-blue-600 dark:text-[#D4AF37]">
                              ~600-800 km
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Approximate</p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">💰 Cost</p>
                            <p className="text-lg font-bold text-blue-600 dark:text-[#D4AF37]">
                              ₹3000-8000
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Budget to premium</p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">🕐 Airport Time</p>
                            <p className="text-lg font-bold text-blue-600 dark:text-[#D4AF37]">
                              2-3 hrs
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Before flight</p>
                          </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-200 dark:border-blue-900/30 text-sm text-zinc-700 dark:text-zinc-300 mb-4">
                          <strong>🎫 Airlines:</strong> Air India, IndiGo, SpiceJet, GoAir, Vistara - Compare prices on Skyscanner, MakemyTrip, or airline websites
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-200 dark:border-green-900/30 text-sm text-zinc-700 dark:text-zinc-300">
                          <strong>🚕 From Airport to Hotel:</strong> On arrival at {destination} airport, use airport taxi, Uber/Ola or hotel pickup service. Expected: ₹800-1200 and 30-45 minutes to your hotel depending on location.
                        </div>
                      </div>
                    )}

                    {/* Personal Vehicle */}
                    {transportMode === "personal" && (
                      <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border-l-4 border-purple-500">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-3xl"><IconCar style={{ color: 'var(--theme-accent)' }} /></div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-[#F8F9FB] mb-1">
                              Direct Journey: {startingLocation} → {destination}
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                              Using your personal vehicle for the entire journey
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">⏱️ Duration</p>
                            <p className="text-lg font-bold text-purple-600 dark:text-[#D4AF37]">
                              8-12 hrs
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">With breaks</p>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">📍 Distance</p>
                            <p className="text-lg font-bold text-purple-600 dark:text-[#D4AF37]">
                              ~400-500 km
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Approximate</p>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">⛽ Fuel Cost</p>
                            <p className="text-lg font-bold text-purple-600 dark:text-[#D4AF37]">
                              ₹2000-3500
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Estimated</p>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">🛣️ Route</p>
                            <p className="text-sm font-bold text-purple-600 dark:text-[#D4AF37]">
                              Highway
                            </p>
                          </div>
                        </div>

                        <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-200 dark:border-purple-900/30 text-sm text-zinc-700 dark:text-zinc-300 mb-4">
                          <strong>🗺️ Route:</strong> Use Google Maps for best route. Recommended route has toll charges (~₹300-500). Check vehicle condition, fuel, spare tire before departing.
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-200 dark:border-amber-900/30 text-sm text-zinc-700 dark:text-zinc-300">
                          <strong>💡 Tips:</strong> Drive during daytime, take breaks every 2-3 hours, avoid night driving if possible. Ensure parking at your hotel - call ahead to confirm.
                        </div>
                      </div>
                    )}

                    {/* Rental Vehicle */}
                    {transportMode === "rental" && (
                      <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border-l-4 border-indigo-500">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-3xl"><IconCar style={{ color: 'var(--theme-accent)' }} /></div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-[#F8F9FB] mb-1">
                              Rental Journey: {startingLocation} → {destination}
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                              Using rental car/hired driver for the entire journey
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">⏱️ Duration</p>
                            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                              8-12 hrs
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">With breaks</p>
                          </div>
                          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">📍 Distance</p>
                            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                              ~400-500 km
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Approximate</p>
                          </div>
                          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1"><IconMoney style={{ display: 'inline-block', verticalAlign: 'middle', color: 'var(--theme-accent)' }} /> Rental Cost</p>
                            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                              ₹4000-8000
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Per day</p>
                          </div>
                          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">🚗 Vehicle Type</p>
                            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                              Sedan/SUV
                            </p>
                          </div>
                        </div>

                        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-3 rounded-lg border border-indigo-200 dark:border-indigo-900/30 text-sm text-zinc-700 dark:text-zinc-300 mb-4">
                          <strong>🏢 Services:</strong> Zoomcar, Avis, Hertz, local rental companies. With driver: ₹2000-4000/day additional. Include fuel and driver meals in budget.
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-200 dark:border-amber-900/30 text-sm text-zinc-700 dark:text-zinc-300">
                          <strong>💡 Tips:</strong> Book 3-5 days in advance for better rates. Ensure insurance coverage. Check vehicle documents and fuel before departure. Driver will handle everything if you book with driver.
                        </div>
                      </div>
                    )}

                    {/* Overall Journey Info */}
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-300 dark:border-green-900/40">
                      <p className="text-sm text-zinc-800 dark:text-zinc-200">
                        <strong>✅ Total Journey:</strong> {startingLocation} → {destination}<br/>
                        <strong>🎯 Estimated Arrival Time:</strong> <span className="text-green-600 dark:text-[#D4AF37] font-bold">{arrivalTime}</span> at your hotel<br/>
                        <strong>💡 Tip:</strong> Depart early from {startingLocation} to ensure you reach by {arrivalTime}. Buffer time recommended: 1-2 hours extra.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Return Journey */}
              {activeDay === -2 && startingLocation && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 rounded-3xl p-6 md:p-10 shadow-sm border border-orange-200 dark:border-orange-900/30 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-orange-500 rounded-l-3xl"></div>
                  <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
                      <span className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-xl">
                      <IconHome style={{ color: 'var(--theme-accent)' }} />
                    </span>
                    Complete Return Journey to {startingLocation}
                  </h2>
                  
                  <div className="space-y-6">
                    {/* LEG 1: Destination to Station/Airport */}
                    {["train", "bus", "flight"].includes(transportMode) && (
                      <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border-l-4 border-orange-500">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-3xl">
                            {intermediateTransport === "personal" && <IconCar style={{ color: 'var(--theme-accent)' }} />}
                            {intermediateTransport === "public" && <IconBus style={{ color: 'var(--theme-accent)' }} />}
                            {intermediateTransport === "taxi" && <IconTaxi style={{ color: 'var(--theme-accent)' }} />}
                            {intermediateTransport === "driver" && <IconCar style={{ color: 'var(--theme-accent)' }} />}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-[#F8F9FB] mb-1">
                              Leg 1: {destination} → {transportMode === "flight" ? "Airport" : transportMode === "train" ? "Railway Station" : "Bus Station"}
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                              From your hotel to the transport hub
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1"><FaCalendar className="inline-block mr-1 theme-accent" /> Duration</p>
                            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                              {intermediateTransport === "personal" && "35-45 min"}
                              {intermediateTransport === "public" && "50-70 min"}
                              {intermediateTransport === "taxi" && "40-50 min"}
                              {intermediateTransport === "driver" && "40-45 min"}
                            </p>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">📍 Distance</p>
                            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                              {intermediateTransport === "personal" && "25-35 km"}
                              {intermediateTransport === "public" && "20-30 km"}
                              {intermediateTransport === "taxi" && "25-35 km"}
                              {intermediateTransport === "driver" && "25-35 km"}
                            </p>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1"><IconMoney className="inline-block mr-1 theme-accent" /> Cost</p>
                            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                              {intermediateTransport === "personal" && "₹200-300"}
                              {intermediateTransport === "public" && "₹50-100"}
                              {intermediateTransport === "taxi" && "₹300-500"}
                              {intermediateTransport === "driver" && "₹600-800"}
                            </p>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">🛣️ Route</p>
                            <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
                              {transportMode === "flight" ? "To Airport" : "To Station"}
                            </p>
                          </div>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-200 dark:border-amber-900/30 text-sm text-zinc-700 dark:text-zinc-300">
                          <strong>🏨 Checkout:</strong> Arrange hotel checkout by 10:00 AM. Pre-book your transport to ensure timely departure. Allow extra time for traffic during peak hours.
                        </div>
                      </div>
                    )}

                    {/* LEG 2: Station/Airport to Home */}
                    {["train", "bus"].includes(transportMode) && (
                      <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border-l-4 border-red-500">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-3xl">
                            {transportMode === "train" && "🚂"}
                            {transportMode === "bus" && "🚌"}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-[#F8F9FB] mb-1">
                              Leg 2: {transportMode === "train" ? "Railway Station" : "Bus Station"} → {startingLocation}
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                              Return journey via {transportMode === "train" ? "train" : "bus"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">⏱️ Duration</p>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">
                              {transportMode === "train" && "6-14 hrs"}
                              {transportMode === "bus" && "8-16 hrs"}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Varies by service</p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">📍 Distance</p>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">
                              ~400-600 km
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Approximate</p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">💰 Cost</p>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">
                              {transportMode === "train" && "₹800-2500"}
                              {transportMode === "bus" && "₹600-1500"}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Class dependent</p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">🎫 Booking</p>
                            <p className="text-sm font-bold text-red-600 dark:text-red-400">
                              {transportMode === "train" && "IRCTC"}
                              {transportMode === "bus" && "Redbus/MakemyTrip"}
                            </p>
                          </div>
                        </div>

                        <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-200 dark:border-red-900/30 text-sm text-zinc-700 dark:text-zinc-300">
                          <strong>📋 Note:</strong> Book return tickets in advance. Same classes and options available as outbound journey. Arrive at station 30-45 min before scheduled time.
                        </div>
                      </div>
                    )}

                    {/* LEG 3: Home arrival */}
                    {["train", "bus"].includes(transportMode) && (
                      <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border-l-4 border-green-500">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-3xl">🏡</div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-[#F8F9FB] mb-1">
                              Leg 3: Station → {startingLocation} (Home)
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                              From station to your final destination
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">⏱️ Duration</p>
                            <p className="text-lg font-bold text-green-600 dark:text-[#D4AF37]">
                              {intermediateTransport === "personal" && "35-45 min"}
                              {intermediateTransport === "public" && "50-70 min"}
                              {intermediateTransport === "taxi" && "40-50 min"}
                              {intermediateTransport === "driver" && "40-45 min"}
                            </p>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">📍 Distance</p>
                            <p className="text-lg font-bold text-green-600 dark:text-[#D4AF37]">
                              {intermediateTransport === "personal" && "25-35 km"}
                              {intermediateTransport === "public" && "20-30 km"}
                              {intermediateTransport === "taxi" && "25-35 km"}
                              {intermediateTransport === "driver" && "25-35 km"}
                            </p>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">💰 Cost</p>
                            <p className="text-lg font-bold text-green-600 dark:text-[#D4AF37]">
                              {intermediateTransport === "personal" && "₹200-300"}
                              {intermediateTransport === "public" && "₹50-100"}
                              {intermediateTransport === "taxi" && "₹300-500"}
                              {intermediateTransport === "driver" && "₹600-800"}
                            </p>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">🏁 Status</p>
                            <p className="text-sm font-bold text-green-600 dark:text-[#D4AF37]">
                              Home Arrival
                            </p>
                          </div>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-200 dark:border-green-900/30 text-sm text-zinc-700 dark:text-zinc-300">
                          <strong>✅ Journey Complete!</strong> You've successfully completed your trip to {destination} and returned safely to {startingLocation}.
                        </div>
                      </div>
                    )}

                    {/* LEG 2: Flight Return */}
                    {transportMode === "flight" && (
                      <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border-l-4 border-red-500">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-3xl">✈️</div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-[#F8F9FB] mb-1">
                              Leg 2: {destination} Airport → {startingLocation}
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                              Return flight to your home city
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">✈️ Flight Time</p>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">
                              3-4.5 hrs
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Flight duration</p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">📍 Distance</p>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">
                              ~600-800 km
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Approximate</p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">💰 Cost</p>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">
                              ₹3000-8000
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Budget to premium</p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">🕐 Airport Time</p>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">
                              2-3 hrs
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Before flight</p>
                          </div>
                        </div>

                        <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-200 dark:border-red-900/30 text-sm text-zinc-700 dark:text-zinc-300">
                          <strong>🎫 Booking:</strong> Book return flights early for better prices. Same airlines available. Arrive at airport 2-3 hours before departure.
                        </div>
                      </div>
                    )}

                    {/* LEG 3: Airport to Home */}
                    {transportMode === "flight" && (
                      <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border-l-4 border-green-500">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-3xl">🏡</div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-[#F8F9FB] mb-1">
                              Leg 3: {startingLocation} Airport → Home
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                              From airport to your final destination
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">⏱️ Duration</p>
                            <p className="text-lg font-bold text-green-600 dark:text-[#D4AF37]">
                              {intermediateTransport === "personal" && "35-45 min"}
                              {intermediateTransport === "public" && "50-70 min"}
                              {intermediateTransport === "taxi" && "40-50 min"}
                              {intermediateTransport === "driver" && "40-45 min"}
                            </p>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">📍 Distance</p>
                            <p className="text-lg font-bold text-green-600 dark:text-[#D4AF37]">
                              {intermediateTransport === "personal" && "25-35 km"}
                              {intermediateTransport === "public" && "20-30 km"}
                              {intermediateTransport === "taxi" && "25-35 km"}
                              {intermediateTransport === "driver" && "25-35 km"}
                            </p>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">💰 Cost</p>
                            <p className="text-lg font-bold text-green-600 dark:text-[#D4AF37]">
                              {intermediateTransport === "personal" && "₹200-300"}
                              {intermediateTransport === "public" && "₹50-100"}
                              {intermediateTransport === "taxi" && "₹300-500"}
                              {intermediateTransport === "driver" && "₹600-800"}
                            </p>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">🏁 Status</p>
                            <p className="text-sm font-bold text-green-600 dark:text-[#D4AF37]">
                              Home Arrival
                            </p>
                          </div>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-200 dark:border-green-900/30 text-sm text-zinc-700 dark:text-zinc-300">
                          <strong>✅ Welcome Home!</strong> You've successfully completed your trip to {destination} and arrived back at {startingLocation}.
                        </div>
                      </div>
                    )}

                    {/* Personal Vehicle Return */}
                    {transportMode === "personal" && (
                      <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border-l-4 border-red-500">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-3xl"><IconCar style={{ color: 'var(--theme-accent)' }} /></div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-[#F8F9FB] mb-1">
                              Return Journey: {destination} → {startingLocation}
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                              Driving back home via personal vehicle
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">⏱️ Duration</p>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">
                              8-12 hrs
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">With breaks</p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">📍 Distance</p>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">
                              ~400-500 km
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Approximate</p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">⛽ Fuel Cost</p>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">
                              ₹2000-3500
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Estimated</p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">🏁 Status</p>
                            <p className="text-sm font-bold text-red-600 dark:text-red-400">
                              Return Home
                            </p>
                          </div>
                        </div>

                        <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-200 dark:border-red-900/30 text-sm text-zinc-700 dark:text-zinc-300 mb-4">
                          <strong>🗺️ Route:</strong> Use Google Maps for best return route. Consider toll charges (~₹300-500). Check weather and road conditions. Drive safely!
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-200 dark:border-green-900/30 text-sm text-zinc-700 dark:text-zinc-300">
                          <strong>✅ Welcome Home!</strong> Safe travels! You've completed your road trip to {destination} and returned home to {startingLocation}.
                        </div>
                      </div>
                    )}

                    {/* Rental Vehicle Return */}
                    {transportMode === "rental" && (
                      <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border-l-4 border-red-500">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-3xl">🚙</div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-[#F8F9FB] mb-1">
                              Return Journey: {destination} → {startingLocation}
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                              Returning with rental car/hired driver
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">⏱️ Duration</p>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">
                              8-12 hrs
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">With breaks</p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">📍 Distance</p>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">
                              ~400-500 km
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Approximate</p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">💰 Rental Cost</p>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">
                              ₹4000-8000
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Per day</p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-900/30">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">🏁 Status</p>
                            <p className="text-sm font-bold text-red-600 dark:text-red-400">
                              Return Drop
                            </p>
                          </div>
                        </div>

                        <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-200 dark:border-red-900/30 text-sm text-zinc-700 dark:text-zinc-300 mb-4">
                          <strong>🏢 Return Rental:</strong> Drop vehicle at rental company location or return to pickup location. Complete final inspection and settle any additional charges.
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-200 dark:border-green-900/30 text-sm text-zinc-700 dark:text-zinc-300">
                          <strong>✅ Welcome Home!</strong> Trip complete! Thank you for your rental. You've successfully returned from {destination} to {startingLocation}.
                        </div>
                      </div>
                    )}

                    {/* Overall Return Summary */}
                    <div className="bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-lg border border-orange-300 dark:border-orange-900/40">
                      <p className="text-sm text-zinc-800 dark:text-zinc-200">
                        <strong>🏁 Complete Return Journey:</strong> {destination} → {startingLocation}<br/>
                        <strong>📊 Total Return Time:</strong> <span className="text-orange-600 dark:text-orange-400 font-bold">
                          {["train", "bus"].includes(transportMode) && "15-22 hours"}
                          {transportMode === "flight" && "8-10 hours"}
                          {["personal", "rental"].includes(transportMode) && "8-12 hours"}
                        </span><br/>
                        <strong>💡 Tip:</strong> Plan your checkout time accordingly and ensure all arrangements are confirmed a day before departure.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {generatedDays.map((day, dayIndex) => {
                const dayPlan = aiPlan[`day${day}`];
                
                // Calculate sequential numbering starting from day 1 check-in
                let sequentialCounter = 1; // Start from 1
                
                // Add activities from previous days
                for (let prevDay = 1; prevDay < day; prevDay++) {
                  const prevDayPlan = aiPlan[`day${prevDay}`] || [];
                  sequentialCounter += prevDayPlan.length;
                }

                return (
                  <div
                    key={day}
                    style={{ display: activeDay === day ? 'block' : 'none' }}
                    className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-10 shadow-sm border border-zinc-200 dark:border-zinc-800 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-[#D4AF37] rounded-l-3xl"></div>

                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
                      <span className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-[#D4AF37]">
                        {day}
                      </span>
                      Day {day} in {destination}
                    </h2>

                    <div className="space-y-6">
                      {/* Hotel Option Header */}
                      {day === 1 && hotels.length > 0 && (
                        <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">Select your base hotel</p>
                              <p className="text-xs text-blue-600 dark:text-[#D4AF37]">This will refocus itinerary generation around your chosen hotel.</p>
                            </div>
                            <select
                              value={selectedHotel?.name || hotels?.[0]?.name || ""}
                              onChange={async (e) => await chooseHotelAndReplan(e.target.value)}
                              className="w-full sm:w-72 p-3 rounded-lg bg-white/90 text-slate-900 dark:bg-zinc-800 dark:text-[#F8F9FB] border border-slate-300 dark:border-zinc-600"
                            >
                              {hotels.map((h: Place) => (
                                <option key={h.name} value={h.name}>
                                  {cleanName(h.name)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <ItineraryCard
                            time="Base"
                            duration="Stay"
                            onSelect={async (hotelName) => await chooseHotelAndReplan(hotelName)}
                            onViewDetails={handleViewDetails}
                            options={hotels.map((h: Place) => ({
                              name: `${cleanName(h.name)}`,
                              rating: h.rating,
                              photo_reference: h.photo_reference,
                              imageUrl: h.imageUrl,
                              imageSource: h.imageSource,
                            }))}
                          />

                          <div className="flex flex-wrap justify-between gap-3">
                            <Link
                              href={`/hotel-search?destination=${encodeURIComponent(destination)}`}
                              className="text-sm text-blue-700 dark:text-blue-300 hover:text-[#D4AF37] underline"
                            >
                              Explore full hotel / room / Airbnb selection
                            </Link>

                            <button
                              onClick={() => router.push(`/hotel-search?destination=${encodeURIComponent(destination)}&startDate=${startDate}&endDate=${endDate}`)}
                              className="px-3 py-2 bg-blue-600 text-[#F8F9FB] rounded-lg text-xs font-semibold hover:bg-[#D4AF37]"
                            >
                              Open Hotel Search
                            </button>
                          </div>

                          {selectedHotel && (
                            <p className="mt-3 text-sm text-blue-700 dark:text-blue-300">
                              Selected hotel: <strong>{cleanName(selectedHotel.name)}</strong>
                            </p>
                          )}
                        </div>
                      )}

                      {/* AI Scheduled Items */}
                      {!dayPlan && isLoading && (
                        <div className="animate-pulse space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-2xl"
                            ></div>
                          ))}
                        </div>
                      )}

                      {dayPlan && dayPlan.length === 0 && (
                        <p className="text-zinc-500 italic">
                          No activities planned for this day yet.
                        </p>
                      )}

                      {dayPlan &&
                        dayPlan.map((item: any, idx: number) => {
                          // Get the next item for transit info
                          const nextItem = idx < dayPlan.length - 1 ? dayPlan[idx + 1] : null;
                          
                          // Debug on first activity of day 1
                          if (idx === 0 && day === 1) {
                            console.log("=== TRANSIT DEBUG - Day 1, Activity 0 ===");
                            console.log("Places available:", places.length, places.map((p: any) => ({ name: p.name, hasLocation: !!p.location })));
                            console.log("Restaurants available:", restaurants.length, restaurants.map((r: any) => ({ name: r.name, hasLocation: !!r.location })));
                            console.log("Hotels available:", hotels.length, hotels.map((h: any) => ({ name: h.name, hasLocation: !!h.location })));
                            console.log("Current activity to match:", item.activity);
                            console.log("Next activity to match:", nextItem?.activity);
                          }
                          
                          // Get locations for transit calculation with multiple matching strategies
                          const allPlaces = [...places, ...restaurants, ...hotels];
                          let currentLocMatch = null;
                          let nextLocMatch = null;
                          
                          // Strategy 1: Exact substring match
                          if (item.activity && allPlaces.length > 0) {
                            const activityLower = item.activity.toLowerCase();
                            // First try exact substring
                            currentLocMatch = allPlaces.find((p: any) =>
                              activityLower.includes(p.name.toLowerCase()) ||
                              p.name.toLowerCase().includes(activityLower)
                            );
                            
                            // Strategy 2: Fuzzy word match
                            if (!currentLocMatch) {
                              currentLocMatch = allPlaces.find((p: any) => {
                                const pNameLower = p.name.toLowerCase();
                                const actWords = activityLower.split(/\s+/).filter((w: string) => w.length > 3);
                                const pWords = pNameLower.split(/\s+/).filter((w: string) => w.length > 3);
                                const matchedWords = actWords.filter((aw: string) => 
                                  pWords.some((pw: string) => pw.includes(aw) || aw.includes(pw))
                                );
                                return matchedWords.length >= Math.min(2, actWords.length, pWords.length);
                              });
                            }
                            
                            // Strategy 3: Pick first place as fallback if activity mentions generic words
                            if (!currentLocMatch && (activityLower.includes("visit") || activityLower.includes("explore") || activityLower.includes("see") || activityLower.includes("tour"))) {
                              currentLocMatch = allPlaces[0];
                              if (idx === 0 && day === 1) console.log("Using fallback first place for:", item.activity);
                            }
                          }
                          
                          if (nextItem?.activity && allPlaces.length > 0) {
                            const activityLower = nextItem.activity.toLowerCase();
                            // First try exact substring
                            nextLocMatch = allPlaces.find((p: any) =>
                              activityLower.includes(p.name.toLowerCase()) ||
                              p.name.toLowerCase().includes(activityLower)
                            );
                            
                            // Strategy 2: Fuzzy word match
                            if (!nextLocMatch) {
                              nextLocMatch = allPlaces.find((p: any) => {
                                const pNameLower = p.name.toLowerCase();
                                const actWords = activityLower.split(/\s+/).filter((w: string) => w.length > 3);
                                const pWords = pNameLower.split(/\s+/).filter((w: string) => w.length > 3);
                                const matchedWords = actWords.filter((aw: string) => 
                                  pWords.some((pw: string) => pw.includes(aw) || aw.includes(pw))
                                );
                                return matchedWords.length >= Math.min(2, actWords.length, pWords.length);
                              });
                            }
                            
                            // Strategy 3: Pick second place if available, or first
                            if (!nextLocMatch && (activityLower.includes("visit") || activityLower.includes("explore") || activityLower.includes("see") || activityLower.includes("lunch") || activityLower.includes("dinner") || activityLower.includes("restaurant"))) {
                              nextLocMatch = allPlaces.length > 1 ? allPlaces[1] : allPlaces[0];
                              if (idx === 0 && day === 1) console.log("Using fallback place for:", nextItem.activity);
                            }
                          }

                          // Extract coordinates properly for transit
                          const sourceCoords = currentLocMatch?.location 
                            ? { lat: currentLocMatch.location.lat, lng: currentLocMatch.location.lng }
                            : null;
                          const destCoords = nextLocMatch?.location
                            ? { lat: nextLocMatch.location.lat, lng: nextLocMatch.location.lng }
                            : null;

                          // Log on first activity of day 1
                          if (idx === 0 && day === 1) {
                            console.log("Match Results:", {
                              currentActivityMatched: currentLocMatch?.name,
                              currentActivityLocation: currentLocMatch?.location,
                              sourceCoords,
                              nextActivityMatched: nextLocMatch?.name,
                              nextActivityLocation: nextLocMatch?.location,
                              destCoords,
                              matchFound: !!currentLocMatch && !!nextLocMatch,
                            });
                            console.log("=== END DEBUG ===\n");
                          }

                          // Determine activity type and if it's an arrival
                          const activityStr = item.activity || "";
                          const isArrivalActivity = activityStr.toLowerCase().includes('arrive in') || activityStr.toLowerCase().includes('arrive at');
                          
                          // Determine activity type
                          let activityType = 'activity';
                          if (activityStr.toLowerCase().includes('breakfast')) activityType = 'breakfast';
                          else if (activityStr.toLowerCase().includes('lunch')) activityType = 'lunch';
                          else if (activityStr.toLowerCase().includes('dinner')) activityType = 'dinner';
                          else if (activityStr.toLowerCase().includes('check in') || activityStr.toLowerCase().includes('check-in')) activityType = 'check-in';
                          else if (activityStr.toLowerCase().includes('check out') || activityStr.toLowerCase().includes('check-out') || activityStr.toLowerCase().includes('return')) {
                            // For end-of-day check-out or return-to-hotel activities, use "end of day X" format
                            activityType = `end of day ${day}`;
                          }
                          else if (isArrivalActivity) activityType = 'arrival';
                          else {
                            // For other activities, assign activity1, activity2, etc. based on position
                            const activityIndex = dayPlan.slice(0, idx + 1).filter((item: any) => 
                              !item.activity?.toLowerCase().includes('breakfast') &&
                              !item.activity?.toLowerCase().includes('lunch') &&
                              !item.activity?.toLowerCase().includes('dinner') &&
                              !item.activity?.toLowerCase().includes('check') &&
                              !item.activity?.toLowerCase().includes('return') &&
                              !item.activity?.toLowerCase().includes('arrive')
                            ).length;
                            activityType = `activity ${activityIndex}`;
                          }

                          return (
                            <div key={idx}>
                              <ItineraryCard
                                time={item.time}
                                duration={item.duration || "Activity"}
                                options={[enrichActivity(item)]}
                                isLast={idx === dayPlan.length - 1}
                                onEdit={(prompt) => handleEditActivity(`day${day}`, idx, prompt)}
                                onViewDetails={handleViewDetails}
                                themeColor="#D4AF37"
                                activityType={activityType}
                                isArrival={isArrivalActivity}
                                sequentialNumber={sequentialCounter + idx}
                              />
                              
                              {/* Transit info between activities - always show if there's a next item */}
                              {nextItem && (
                                <TransitInfoCard
                                  sourceName={item.activity || "Current Location"}
                                  destName={nextItem.activity || "Next Activity"}
                                  source={sourceCoords}
                                  destination={destCoords}
                                  transitMode={transitMode}
                                  budget={budget}
                                  destinationCity={destination}
                                  sourceIndex={sequentialCounter + idx}
                                  destIndex={sequentialCounter + idx + 1}
                                  themeColor="#D4AF37"
                                  startTime={item.time}
                                />
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="lg:w-[40%]">
              <div className="sticky top-6 h-[600px] w-full rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg">
                <MapView 
                  apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""} 
                  locations={getMapLocations} 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlanTrip() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-zinc-950 text-[#F8F9FB]">Loading planner...</div>}>
      <PlanTripContent />
    </Suspense>
  );
}
