import { GoogleGenAI } from "@google/genai";

async function main() {
  const ai = new GoogleGenAI({
    apiKey: process.env["GEMINI_API_KEY"],
  });

  const config = {};
  const model = "gemini-1.5-flash";

  // Sample data to make the prompt work
  const data = {
    tripType: "leisure",
    places: [{ name: "Red Fort", rating: 4.5 }],
    restaurants: [{ name: "Karim's", rating: 4.2 }],
    hotels: [{ name: "Taj Mahal Hotel", rating: 4.8 }],
  };

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `You are a professional travel planner AI.

Create a smart, fully timed itinerary for the trip.

Destination: Delhi
Arrival Time: march 30
Days: 4
Trip Type: ${data.tripType || "leisure"}

Include hotels, food breaks, and local attractions.
Consider travel time, traffic, and weather.
Optimize stay duration per place and avoid hectic schedules.

Places:
${JSON.stringify(data.places)}

Restaurants:
${JSON.stringify(data.restaurants)}

Hotels:
${JSON.stringify(data.hotels)}

Return ONLY valid JSON in this exact format with no additional text or markdown:

{
 "day1":[
  {"time":"10:00","activity":"Arrive at station"},

  {"time":"10:30","activity":"Reach hotel"},
  {"time":"11:15","activity":"Breakfast"},
  {"time":"12:30","activity":"Visit local attraction"}
 ],
 "day2": [...]
}`,
        },
        {
          text: `Please give me the detailed itinerary in JSON format.`,
        },
      ],
    },
  ];

  try {
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    for await (const chunk of response) {
      if (chunk.text) {
        process.stdout.write(chunk.text);
        fullText += chunk.text;
      }
    }
    console.log("\\n\\nFinished Generation.");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
