import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

interface ItineraryPlace {
  name: string;
  description: string;
  mapLink: string;
}

interface SelectedHotel {
  name: string;
  description?: string;
  mapLink?: string;
}

interface ItineraryRequest {
  destination: string;
  startDate?: string;
  endDate?: string;
  days: number;
  arrival?: string;
  budget?: string;
  tripType?: string;
  companion?: string;
  pace?: string;
  dietary?: string;
  transitMode?: string;
  customNotes?: string;
  selectedHotel?: SelectedHotel | null;
  selectedStayType?: string;
  places?: ItineraryPlace[];
  restaurants?: ItineraryPlace[];
  hotels?: ItineraryPlace[];
}

export async function generateLLMItinerary(data: ItineraryRequest) {
  const prompt = `
You are a professional travel planner AI. Generate a STRUCTURED daily itinerary following EXACT rules.

Destination: ${data.destination}
Dates: ${data.startDate} to ${data.endDate} (${data.days} days)
Arrival Time: ${data.arrival}
Budget: ${data.budget}
Primary Interests: ${data.tripType || "leisure"}
Companion: ${data.companion || "Solo"}
Travel Pace: ${data.pace || "Moderate"}
Dietary Restrictions: ${data.dietary || "None"}
Preferred Intercity Transit: ${data.transitMode || "Any"}

Additional User Requests/Notes:
${data.customNotes ? data.customNotes : "None"}

Preferred Hotel: ${data.selectedHotel?.name || "No specific hotel selected"}
Selected Stay Type: ${data.selectedStayType || "hotel"}

CRITICAL ITINERARY STRUCTURE FOR EACH DAY:
======================================

Day 1 Start:
- TIME 06:00: Depart Hotel (or Arrive at destination if first day)
- TIME 07:00-09:00: BREAKFAST (LLM select from restaurants list, based on ratings and customer interests)
- TIME 09:00-13:00: ACTIVITIES (select 1-2 places from places list, based on ratings and customer interests)
- TIME 13:00-14:00: LUNCH (select from restaurants near previous activity or next activity, based on ratings)
- TIME 14:00-17:00: MORE ACTIVITIES (select different places, based on ratings and customer interests)
- TIME 17:00-18:00: EVENING SNACK (select from restaurants, famous food of that place, based on ratings)
- TIME 18:00-20:00: FINAL ACTIVITY (select remaining places, based on ratings)
- TIME 20:00-21:00: DINNER (select from restaurants, based on ratings and customer interests)
- TIME 21:00+: RETURN TO HOTEL (Rest)

Days 2, 3, etc: Follow same structure starting from TIME 06:00

CRITICAL RULES - MUST FOLLOW:
======================================

RULE 1 - NO PLACE REPETITION:
- Once a place/restaurant/activity is used on ANY day, NEVER use it again
- Track all used places across all days
- Each day must have completely different places than previous days
- Maintain a list of used places and ensure no duplicates

RULE 2 - PROXIMITY FOR DINING:
- When selecting lunch/dinner/snack restaurants:
  * Must be NEAR the current activity location, OR
  * Must be NEAR the next activity location after eating
- Check location proximity before suggesting restaurants
- Avoid restaurants far from activity clusters

RULE 3 - LOGICAL FLOW:
- Activities should have logical geographical flow
- Don't jump between distant locations unnecessarily
- Group nearby activities together
- Consider travel time between locations

RULE 4 - PLACE SELECTION PRIORITY:
- SELECT from provided Places, Restaurants, and Hotels lists FIRST
- Use exact names from lists so images can be matched
- Only suggest new places if lists are insufficient
- Prioritize high-rated places from the lists

RULE 5 - TIME SLOTS ARE FIXED:
- Do NOT change times from the structure above
- Times should match exactly: 07:00 for breakfast, 13:00 for lunch, etc.
- Keep duration consistent (breakfast 2 hours, activities 4 hours, etc.)

Available Places (select different ones each day):
${JSON.stringify(data.places)}

Available Restaurants (select different ones each day):
${JSON.stringify(data.restaurants)}

Available Hotels:
${JSON.stringify(data.hotels)}

IMPORTANT NOTES:
- DO NOT include transit/travel time/distance in descriptions
- DO NOT include parking info in descriptions
- Transit field should be brief: "Walk 10 mins" or "Drive 5 mins" or "Public transit"
- Focus descriptions on the ACTIVITY ITSELF, what to see, tips, interesting facts
- Ensure Dietary Restrictions are respected for all restaurants
- Optimize for Travel Pace: slow=fewer activities, fast=more activities, moderate=balanced

Return ONLY valid JSON in this exact format with no additional text or markdown:

{
  "day1": [
    {
      "time": "06:00",
      "activity": "Depart from Hotel",
      "description": "Start your day of exploration",
      "mapLink": "https://maps.google.com/?q=${data.destination}",
      "transit": "Walk"
    },
    {
      "time": "07:00",
      "activity": "Breakfast at [EXACT RESTAURANT NAME FROM LIST]",
      "description": "Details about what to eat, specialties, atmosphere. Tips for enjoying breakfast.",
      "mapLink": "https://maps.google.com/?q=Restaurant+Name",
      "transit": "Walk 5 mins"
    }
  ],
  "day2": [...],
  "day3": [...]
}
`;

  const config = {
    responseMimeType: 'text/plain',
  };

  const model = "gemini-pro";
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: prompt,
        },
      ],
    },
  ];

  let fullText = "";
  let retries = 5;
  let lastError: Error | null = null;

  while (retries > 0) {
    try {
      const response = await ai.models.generateContentStream({
        model,
        config,
        contents,
      });

      for await (const chunk of response) {
        if (chunk.text) {
          fullText += chunk.text;
        }
      }
      
      // If successful, break out of retry loop
      break;
    } catch (err) {
      lastError = err as Error;
      retries--;
      if (retries > 0) {
        // Longer exponential backoff with longer max wait (up to 20 seconds)
        const waitTime = Math.min(3000 * (6 - retries), 20000);
        console.log(`Retrying itinerary generation in ${waitTime}ms... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // If AI fails, generate a template-based itinerary as fallback
  if (!fullText && lastError) {
    console.log("AI generation failed, using template fallback");
    return generateTemplateItinerary(data);
  }

  // Extract JSON from response (handles thinking blocks, markdown, etc.)
  const jsonMatch = fullText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.log("No JSON found in AI response, using template fallback");
    return generateTemplateItinerary(data);
  }
  
  const cleaned = jsonMatch[0];
  return JSON.parse(cleaned);
}

// Template-based itinerary generation as fallback - FOLLOWS STRUCTURED RULES
function generateTemplateItinerary(data: ItineraryRequest) {
  const itinerary: Record<string, Array<{ time: string; activity: string; description: string; mapLink: string; transit: string }>> = {};
  
  // Use provided places and restaurants, or create generic ones
  const places = data.places && data.places.length > 0 ? data.places : [
    { name: "City Center", description: "Explore the heart of the city", mapLink: `https://maps.google.com/?q=${data.destination} city center` },
    { name: "Local Market", description: "Experience local culture and shopping", mapLink: `https://maps.google.com/?q=${data.destination} market` },
    { name: "Historic Site", description: "Visit historical landmarks", mapLink: `https://maps.google.com/?q=${data.destination} historic site` }
  ];
  
  const restaurants = data.restaurants && data.restaurants.length > 0 ? data.restaurants : [
    { name: "Local Restaurant", description: "Authentic local cuisine", mapLink: `https://maps.google.com/?q=${data.destination} restaurant` },
    { name: "Café", description: "Coffee and light meals", mapLink: `https://maps.google.com/?q=${data.destination} cafe` }
  ];

  // Track used places to enforce RULE 1 - No Repetition
  const usedPlaces = new Set<string>();
  const usedRestaurants = new Set<string>();

  // Generate itinerary for each day
  for (let day = 1; day <= data.days; day++) {
    const dayKey = `day${day}`;
    itinerary[dayKey] = [];
    
    // Day 1: Arrival, then follow structured schedule
    if (day === 1) {
      itinerary[dayKey].push({
        time: data.arrival || "06:00",
        activity: `Arrive in ${data.destination}`,
        description: `Welcome to ${data.destination}! Check into your ${data.selectedStayType || 'hotel'} and get settled. Freshen up and prepare for your adventure.`,
        mapLink: data.selectedHotel?.mapLink || `https://maps.google.com/?q=${data.destination}`,
        transit: data.transitMode || "Walk"
      });
    } else {
      // Days 2+: Start with Depart Hotel
      itinerary[dayKey].push({
        time: "06:00",
        activity: "Depart from Hotel",
        description: "Begin your day of exploration. Check out and head out to discover new destinations.",
        mapLink: data.selectedHotel?.mapLink || "",
        transit: "Walk"
      });
    }
    
    // 07:00-09:00: BREAKFAST
    let breakfastRest = restaurants.find(r => !usedRestaurants.has(r.name));
    if (!breakfastRest) {
      usedRestaurants.clear();
      breakfastRest = restaurants[0];
    }
    usedRestaurants.add(breakfastRest.name);
    
    itinerary[dayKey].push({
      time: "07:00",
      activity: `Breakfast at ${breakfastRest.name}`,
      description: `Enjoy a delicious breakfast experience. ${breakfastRest.description} Perfect start to your day.`,
      mapLink: breakfastRest.mapLink,
      transit: "Walk"
    });
    
    // 09:00-13:00: ACTIVITY 1-2
    let activity1 = places.find(p => !usedPlaces.has(p.name));
    if (!activity1) {
      usedPlaces.clear();
      activity1 = places[0];
    }
    usedPlaces.add(activity1.name);
    
    itinerary[dayKey].push({
      time: "09:00",
      activity: activity1.name,
      description: `${activity1.description} Explore and enjoy this wonderful destination. Take your time to experience the local culture and attractions.`,
      mapLink: activity1.mapLink,
      transit: "Walk"
    });
    
    // 13:00-14:00: LUNCH (near activity1 or next activity)
    let lunchRest = restaurants.find(r => !usedRestaurants.has(r.name));
    if (!lunchRest) {
      usedRestaurants.clear();
      lunchRest = restaurants[0];
    }
    usedRestaurants.add(lunchRest.name);
    
    itinerary[dayKey].push({
      time: "13:00",
      activity: `Lunch at ${lunchRest.name}`,
      description: `Enjoy a satisfying lunch. ${lunchRest.description} Perfect location for a midday break.`,
      mapLink: lunchRest.mapLink,
      transit: "Walk"
    });
    
    // 14:00-17:00: ACTIVITY 3-4
    let activity2 = places.find(p => !usedPlaces.has(p.name));
    if (!activity2) {
      usedPlaces.clear();
      activity2 = places[1] || places[0];
    }
    usedPlaces.add(activity2.name);
    
    itinerary[dayKey].push({
      time: "14:00",
      activity: activity2.name,
      description: `${activity2.description} Continue your exploration with this exciting destination. Discover new perspectives and experiences.`,
      mapLink: activity2.mapLink,
      transit: "Walk"
    });
    
    // 17:00-18:00: EVENING SNACK
    let snackRest = restaurants.find(r => !usedRestaurants.has(r.name));
    if (!snackRest) {
      usedRestaurants.clear();
      snackRest = restaurants[2] || restaurants[0];
    }
    usedRestaurants.add(snackRest.name);
    
    itinerary[dayKey].push({
      time: "17:00",
      activity: `Evening Snack at ${snackRest.name}`,
      description: `${snackRest.description} Enjoy famous local snacks and refreshments. A perfect time to relax before your final activity.`,
      mapLink: snackRest.mapLink,
      transit: "Walk"
    });
    
    // 18:00-20:00: ACTIVITY 5 (Final activity)
    let activity3 = places.find(p => !usedPlaces.has(p.name));
    if (!activity3) {
      usedPlaces.clear();
      activity3 = places[2] || places[0];
    }
    usedPlaces.add(activity3.name);
    
    itinerary[dayKey].push({
      time: "18:00",
      activity: activity3.name,
      description: `${activity3.description} Your final exploration of the day. Soak in the sunset views and make lasting memories.`,
      mapLink: activity3.mapLink,
      transit: "Walk"
    });
    
    // 20:00-21:00: DINNER
    let dinnerRest = restaurants.find(r => !usedRestaurants.has(r.name));
    if (!dinnerRest) {
      usedRestaurants.clear();
      dinnerRest = restaurants[0];
    }
    usedRestaurants.add(dinnerRest.name);
    
    itinerary[dayKey].push({
      time: "20:00",
      activity: `Dinner at ${dinnerRest.name}`,
      description: `Enjoy a wonderful dinner experience. ${dinnerRest.description} Savor local flavors and celebrate your day.`,
      mapLink: dinnerRest.mapLink,
      transit: "Walk"
    });
    
    // 21:00+: RETURN TO HOTEL
    itinerary[dayKey].push({
      time: "21:00",
      activity: "Return to Hotel",
      description: "Head back to your accommodation for a well-deserved rest. Relax and prepare for another exciting day ahead.",
      mapLink: data.selectedHotel?.mapLink || "",
      transit: "Walk"
    });
  }
  
  return itinerary;
}