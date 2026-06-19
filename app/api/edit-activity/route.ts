/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

enum ThinkingLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { currentActivity, time, day, destination, customPrompt } = body;

    const prompt = `
You are an expert travel planner assistant. The user wants to change a specific activity in their itinerary based on a custom request.

Context:
Destination: ${destination}
Day of trip: ${day}
Time of activity: ${time}
Current scheduled activity: ${JSON.stringify(currentActivity)}

User's custom request:
"${customPrompt}"

Please provide a replacement activity that fits the time slot and fulfills the user's custom request. Ensure to maintain the same format.
Provide ADDON data like an explanation, suggested map search links, or photo descriptions.

Return ONLY valid JSON in this exact format with no additional text or markdown:

{
  "time": "${time}",
  "activity": "New Activity Name",
  "description": "Detailed advice or photo description",
  "mapLink": "https://maps.google.com/?q=New+Activity+Name",
  "transit": "Recommended mode to reach here (if applicable, else empty string)"
}
`;

    const config = {
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
      tools: [{ googleSearch: {} }],
      responseMimeType: 'text/plain',
    };

    const model = "gemini-pro";
    const contents = [{ role: "user", parts: [{ text: prompt }] }];

    let fullText = "";
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

    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const cleaned = jsonMatch[0];
    const newActivity = JSON.parse(cleaned);

    return NextResponse.json(newActivity);
  } catch (error: any) {
    console.error("Error editing activity:", error);
    return NextResponse.json(
      { error: "Failed to edit activity", details: error.message },
      { status: 500 }
    );
  }
}
