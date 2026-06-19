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
    const { destination } = await req.json();
    
    if (!destination) {
      return NextResponse.json({ facts: [] });
    }

    const prompt = `You are a travel trivia AI. Provide 5 fun, interesting, and slightly obscure travel facts specifically about: ${destination}. Return ONLY a raw JSON array of strings. Do not include any explanations, markdown code blocks, or formatting. Example: ["Fact 1", "Fact 2"]`;

    const config = {
      responseMimeType: 'application/json',
    };

    const contents = [{ role: "user", parts: [{ text: prompt }] }];

    const response = await ai.models.generateContent({
      model: "gemini-pro",
      config,
      contents,
    });

    const text = response.text || "[]";
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```(json)?/gi, '').replace(/```/g, '').trim();
    }
    
    const facts = JSON.parse(cleaned);

    return NextResponse.json({ facts });
  } catch (error: unknown) {
    console.error("Error generating customized facts:", error);
    // Silent fail by returning an empty array, it will just keep using default facts
    return NextResponse.json({ facts: [] });
  }
}
