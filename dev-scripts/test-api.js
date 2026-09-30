import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyAWIjMxy0_Qp5ekTycf9iSM4rXWsekB3II",
});

async function testKey() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello, this is a test. Reply with OK if you receive this.",
    });
    console.log("Success! Response:", response.text);
  } catch (error) {
    console.error("Error testing API key:", error);
  }
}

testKey();
