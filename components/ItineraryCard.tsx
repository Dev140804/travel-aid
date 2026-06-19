"use client";

import { useState } from "react";
import { FaStar, FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";

type Option = {
  name: string;
  rating?: number | string;
  photo_reference?: string | null;
  imageUrl?: string; // Fallback image URL (Unsplash, etc.)
  imageSource?: string; // Source of image ('google-maps', 'unsplash', etc.)
  location?: { lat: number; lng: number } | null;
  description?: string;
  mapLink?: string;
  transit?: string;
};

type Props = {
  time: string;
  duration: string;
  options: (string | Option)[];
  onSelect?: (place: string) => void;
  onEdit?: (prompt: string) => void;
  onViewDetails?: (place: string | Option) => void;
  startIndex?: number;
  isFirst?: boolean;
  isLast?: boolean;
  themeColor?: string; // Theme color for the destination
  activityType?: string; // Type of activity (breakfast, lunch, dinner, activity1, activity2, etc.)
  isArrival?: boolean; // Whether this is an arrival activity
  sequentialNumber?: number; // Sequential number for lollipop design
};

export default function ItineraryCard({
  time,
  duration,
  options,
  onSelect,
  onEdit,
  onViewDetails,
  startIndex = 0,
  isLast = false,
  themeColor = "#D4AF37", // Default gold theme color
  activityType = "activity", // Default activity type
  isArrival = false, // Default not arrival
  sequentialNumber, // Sequential number for lollipop design
}: Props) {
  const [index, setIndex] = useState(startIndex);
  const [isEditing, setIsEditing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [showViewDetailsButton, setShowViewDetailsButton] = useState(false);

  const nextOption = () => {
    if (options.length === 0) return;
    const newIndex = (index + 1) % options.length;
    setIndex(newIndex);
    const selected = options[newIndex];
    if (onSelect) onSelect(typeof selected === 'string' ? selected : selected.name);
  };

  const prevOption = () => {
    if (options.length === 0) return;
    const newIndex = (index - 1 + options.length) % options.length;
    setIndex(newIndex);
    const selected = options[newIndex];
    if (onSelect) onSelect(typeof selected === 'string' ? selected : selected.name);
  };

  const handleEditSubmit = () => {
    if (customPrompt.trim() && onEdit) {
      onEdit(customPrompt);
      setIsEditing(false);
      setCustomPrompt("");
    }
  };

  const currentOption = options[index];
  const displayName = typeof currentOption === 'string' 
    ? currentOption 
    : currentOption?.name || "Loading...";

  // Determine the title to display based on activity type
  const getDisplayTitle = () => {
    // For check-in activities (start of day), show "Depart Hotel"
    if (activityType === 'check-in' || activityType?.includes('check in')) {
      return "Depart Hotel";
    }
    // For check-out activities (end of day), show "Return to Hotel"
    if (activityType?.includes('end of day') || activityType?.includes('check out')) {
      return "Return to Hotel";
    }
    // For all other activities, use the actual name
    return displayName;
  };

  const titleToDisplay = getDisplayTitle();

  const photoRef = typeof currentOption === 'object' ? currentOption?.photo_reference : null;
  const imageUrl = typeof currentOption === 'object' && currentOption?.imageUrl ? currentOption.imageUrl : null;
  const hasImage = photoRef || imageUrl;

  // Get a display-friendly version of the activity type for the tag
  const getActivityTypeDisplay = () => {
    if (activityType?.includes('end of day')) return 'Rest';
    if (activityType === 'check-in') return 'Check-in';
    if (activityType === 'breakfast') return 'Breakfast';
    if (activityType === 'lunch') return 'Lunch';
    if (activityType === 'dinner') return 'Dinner';
    if (activityType === 'arrival') return 'Arrival';
    // For "activity 1", "activity 2", etc., capitalize it
    return activityType.charAt(0).toUpperCase() + activityType.slice(1);
  };

  // Generate bullet points from description or create generic ones
  const getBulletPoints = () => {
    const desc = typeof currentOption === 'object' ? currentOption?.description : '';
    
    // For arrival activities, create facts about the place
    if (isArrival) {
      const placeName = displayName.replace(/^(Arrive in|Arrive at)\s+/i, '');
      return [
        `Welcome to ${placeName}! Get ready for an amazing adventure.`,
        `${placeName} is known for its stunning landscapes and rich cultural heritage.`
      ];
    }

    // For check-in (start of day) activities
    if (activityType === 'check-in' || activityType?.includes('check in')) {
      return [
        `Begin your day of exploration and adventure.`,
        `Head out from your accommodation to discover new destinations.`
      ];
    }

    // For check-out / end of day activities
    if (activityType?.includes('end of day') || activityType?.includes('check out')) {
      return [
        `Return to your hotel for rest and relaxation.`,
        `Prepare for the next day of your journey.`
      ];
    }
    
    if (desc) {
      const sentences = desc.split(/[.!?]/).filter(s => s.trim());
      return sentences.slice(0, 2).map(s => s.trim());
    }
    
    // Default bullet points based on activity type
    if (activityType.includes('breakfast') || activityType.includes('lunch') || activityType.includes('dinner')) {
      return [
        `Enjoy authentic local cuisine and traditional flavors.`,
        `Experience the vibrant food culture and culinary heritage.`
      ];
    }
    
    return [
      `Explore and experience ${displayName}`,
      `Enjoy the local attractions and ambiance`
    ];
  };

  const bulletPoints = getBulletPoints();

  return (
    <div className="relative pl-12 mb-6">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-5 top-12 bottom-[-24px] w-[2px]" style={{ backgroundColor: themeColor }} />
      )}
      
      {/* Lollipop timeline dot with number */}
      <div className="absolute left-2 top-8 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm z-10" style={{ backgroundColor: themeColor }}>
        {sequentialNumber || 1}
      </div>

      <div className={`bg-slate-900/90 backdrop-blur-sm rounded-3xl border shadow-xl overflow-hidden hover:border-slate-600 transition-colors ${
        isArrival ? 'border-green-500 bg-gradient-to-br from-green-900/20 to-emerald-900/20' : 'border-slate-700'
      }`}>
        {hasImage && (
          <div 
            className="relative w-full h-56 group overflow-hidden cursor-pointer"
            onMouseEnter={() => setShowViewDetailsButton(true)}
            onMouseLeave={() => setShowViewDetailsButton(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoRef ? `/api/photo?ref=${photoRef}` : (imageUrl || '')}
              alt={displayName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />
            
            {/* Activity Type Tag - Top Right */}
            <div className="absolute top-3 right-3 z-20">
              <span 
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                style={{ 
                  backgroundColor: themeColor + "30",
                  borderColor: themeColor,
                  borderWidth: "2px",
                  color: themeColor
                }}
              >
                {getActivityTypeDisplay()}
              </span>
            </div>
            
            {/* Navigation buttons */}
            <button
              onClick={prevOption}
              disabled={options.length <= 1}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-slate-900/70 p-2 text-slate-200 hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={nextOption}
              disabled={options.length <= 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-slate-900/70 p-2 text-slate-200 hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <FaChevronRight />
            </button>

            {/* View Details button on hover */}
            {showViewDetailsButton && onViewDetails && (
              <div className="absolute inset-0 flex items-center justify-center z-30 bg-slate-950/40 transition-opacity duration-200">
                <button
                  onClick={() => onViewDetails(currentOption)}
                  className="rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E8C547] px-6 py-3 text-sm font-bold text-slate-950 hover:shadow-lg hover:shadow-[#D4AF37]/50 transition-all duration-200 transform hover:scale-105"
                >
                  View Details
                </button>
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          {/* Name with Rating in brackets - Only for non-arrival activities and non-hotel activities */}
          {!isArrival && !activityType?.includes('check') && !activityType?.includes('end of day') && (
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-center sm:text-left" style={{ color: themeColor }}>
                {titleToDisplay}
                {typeof currentOption === 'object' && currentOption?.rating && (
                  <span className="text-gray-300 font-normal ml-1">
                    ({currentOption.rating}
                    {typeof currentOption.rating === 'number' && currentOption.rating > 0 ? <FaStar className="inline text-yellow-400 ml-1" /> : null})
                  </span>
                )}
              </h3>
            </div>
          )}

          {/* Hotel Activity Title - No rating */}
          {!isArrival && (activityType?.includes('check') || activityType?.includes('end of day')) && (
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-center sm:text-left" style={{ color: themeColor }}>
                {titleToDisplay}
              </h3>
            </div>
          )}

          {/* Bullet Points */}
          <ul className="space-y-2 mb-6">
            {bulletPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                <span style={{ color: themeColor }} className="text-lg font-bold mt-0 flex-shrink-0">
                  •
                </span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>

          {/* Edit button - Bottom Right */}
          <div className="flex justify-end">
            {onEdit && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          {isEditing && (
            <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
              <p className="text-sm text-slate-400 mb-2">Want something else? Describe your preference:</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  placeholder="e.g. A family friendly park nearby"
                  className="flex-1 min-w-0 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit()}
                />
                <button
                  onClick={handleEditSubmit}
                  disabled={!customPrompt.trim()}
                  className="rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50"
                >
                  Update
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}