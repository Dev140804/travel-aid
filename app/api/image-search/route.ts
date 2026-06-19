import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

/**
 * Fallback image search API
 * Searches for images when Google Maps photo_reference is not available
 * Uses multiple sources: Google Places, Unsplash, or generates search links
 */

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function searchGooglePlaces(query: string, destination: string): Promise<string | null> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const searchQuery = `${query} in ${destination}`;
    
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
    
    const response = await fetch(url, { next: { revalidate: 86400 } });
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const photoRef = data.results[0].photos?.[0]?.photo_reference;
      if (photoRef) {
        return photoRef;
      }
    }
    return null;
  } catch (error) {
    console.error("Google Places search error:", error);
    return null;
  }
}

async function searchUnsplash(query: string): Promise<string | null> {
  try {
    // Try to use Unsplash API if available
    const unsplashKey = process.env.NEXT_PUBLIC_UNSPLASH_API_KEY;
    
    if (!unsplashKey) {
      // Return a generic Unsplash link without API key
      // Unsplash allows hotlinking for images
      const encodedQuery = encodeURIComponent(query);
      return `https://source.unsplash.com/400x300/?${encodedQuery}`;
    }

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${unsplashKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results && data.results[0]) {
      return data.results[0].urls?.regular;
    }
    
    return `https://source.unsplash.com/400x300/?${encodeURIComponent(query)}`;
  } catch (error) {
    console.error("Unsplash search error:", error);
    // Return fallback Unsplash generic image URL
    return `https://source.unsplash.com/400x300/?${encodeURIComponent(query)}`;
  }
}

function generateBingImageSearchUrl(query: string): string {
  return `https://www.bing.com/images/search?q=${encodeURIComponent(query)}`;
}

async function verifyImageWithGemini(imageUrl: string, placeName: string): Promise<boolean> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.log("No Gemini API key, skipping image verification");
      return true; // Default to true if no API key
    }

    const model = "gemini-pro";
    const prompt = `Analyze this image and determine if it shows ${placeName} or is related to ${placeName}. 
    The image URL is: ${imageUrl}
    
    Consider:
    - Does the image show landmarks, scenery, or features typically associated with ${placeName}?
    - Is this a genuine photo of ${placeName} or just a generic stock image?
    - Does the image match what you'd expect to see at ${placeName}?
    
    Respond with only "YES" if the image is genuinely related to ${placeName}, or "NO" if it's not.`;

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

    const response = await ai.models.generateContent({
      model,
      contents,
    });

    const result = await response;
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const finalResponse = responseText.trim().toUpperCase();
    
    return finalResponse.includes("YES");
  } catch (error) {
    console.error("Image verification error:", error);
    return true; // Default to true on error
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const destination = searchParams.get("destination") || "";
    const source = searchParams.get("source"); // 'google-places', 'unsplash', 'search-link'
    const verifyImage = searchParams.get("verify") === "true"; // New parameter for image verification

    if (!query) {
      return NextResponse.json({ error: "Query parameter required" }, { status: 400 });
    }

    let imageUrl: string | null = null;
    let finalSource = "unknown";

    // Try Google Places first for specific locations
    if (!source || source === "google-places") {
      const photoRef = await searchGooglePlaces(query, destination);
      if (photoRef) {
        imageUrl = `/api/photo?ref=${photoRef}`;
        finalSource = "google-maps";
      }
    }

    // Try Unsplash for generic images
    if (!imageUrl && (!source || source === "unsplash")) {
      const unsplashUrl = await searchUnsplash(query);
      if (unsplashUrl) {
        imageUrl = unsplashUrl;
        finalSource = "unsplash";
      }
    }

    // Verify image if requested and we have an image URL
    let isVerified = true;
    if (verifyImage && imageUrl) {
      isVerified = await verifyImageWithGemini(imageUrl, query);
      if (!isVerified) {
        console.log(`Image verification failed for ${query}, trying alternative...`);
        // If verification fails, try to get a different image
        if (finalSource === "unsplash") {
          // Try a more specific search
          const specificQuery = `${query} landmark ${destination}`;
          const alternativeUrl = await searchUnsplash(specificQuery);
          if (alternativeUrl && alternativeUrl !== imageUrl) {
            imageUrl = alternativeUrl;
            isVerified = await verifyImageWithGemini(imageUrl, query);
          }
        }
      }
    }

    // Return search link as fallback
    if (!imageUrl) {
      return NextResponse.json({ 
        imageUrl: generateBingImageSearchUrl(query),
        source: "bing-search-link",
        verified: false
      });
    }

    return NextResponse.json({ 
      imageUrl,
      source: finalSource,
      verified: isVerified
    });

  } catch (error) {
    console.error("Image search API error:", error);
    return NextResponse.json({ 
      error: "Failed to search images",
      imageUrl: "https://via.placeholder.com/400x300?text=No+Image"
    }, { status: 500 });
  }
}
