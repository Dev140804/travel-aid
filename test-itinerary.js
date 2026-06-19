import { GoogleGenAI } from "@google/genai";

async function testItinerary() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const testData = {
    destination: "Udaipur",
    arrival: "10:00 AM",
    days: 2,
    places: [
      { name: "City Palace", rating: 4.5 },
      { name: "Lake Pichola", rating: 4.7 },
    ],
    restaurants: [
      { name: "Bayleaf Udaipur", rating: 4.7 },
      { name: "Taj Lake Palace", rating: 4.8 },
    ],
    hotels: [
      { name: "Hotel A", rating: 4.5 },
      { name: "Hotel B", rating: 4.6 },
    ],
  };

  const prompt = `
You are a professional travel planner AI.

Create a smart, fully timed itinerary for the trip.

Destination: ${testData.destination}
Arrival Time: ${testData.arrival}
Days: ${testData.days}
Trip Type: leisure

Include hotels, food breaks, and local attractions.
Consider travel time, traffic, and weather.
Optimize stay duration per place and avoid hectic schedules.

Places:
${JSON.stringify(testData.places)}

Restaurants:
${JSON.stringify(testData.restaurants)}

Hotels:
${JSON.stringify(testData.hotels)}

Return ONLY valid JSON in this exact format with no additional text or markdown:

{
 "day1":[
  {"time":"10:00","activity":"Arrive at station"},
  {"time":"10:30","activity":"Reach hotel"},
  {"time":"11:15","activity":"Breakfast"},
  {"time":"12:30","activity":"Visit local attraction"}
 ],
 "day2": [...]
}
`;

  try {
    console.log("Generating itinerary...");

    const config = {

    };

    const model = "gemini-2.5-flash";
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

    console.log("Raw response length:", fullText.length);
    console.log("Raw response preview:", fullText.substring(0, 500));

    // Extract JSON from response
    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const cleaned = jsonMatch[0];
    const result = JSON.parse(cleaned);

    console.log("Success!");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

testItinerary();
