import { NextResponse } from "next/server";
import { generateLLMItinerary } from "@/lib/llmPlanner";

export async function POST(req: Request) {
  try {
    console.log("Environment check:", {
      hasApiKey: !!process.env.GEMINI_API_KEY,
      apiKeyLength: process.env.GEMINI_API_KEY?.length,
      nodeEnv: process.env.NODE_ENV
    });
    
    const body = await req.json();
    console.log("Request body:", JSON.stringify(body, null, 2));
    
    const itinerary = await generateLLMItinerary(body);
    console.log("Generated itinerary:", JSON.stringify(itinerary, null, 2));
    
    return NextResponse.json(itinerary);
  } catch (error) {
    console.error("AI itinerary error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to generate itinerary", details: errorMessage }, 
      { status: 500 }
    );
  }
}