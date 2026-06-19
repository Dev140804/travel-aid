import { GoogleGenAI } from "@google/genai";

async function test() {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const model = "gemini-2.5-flash";
    const config = {};
    
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: "Hello, test message. Reply with 'Success!'",
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

    console.log("Success:", fullText);
  } catch (error) {
    console.error("Error:", error);
  }
}

test();