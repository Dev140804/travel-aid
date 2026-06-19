import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const models = await genAI.listModels();
    console.log("Available models:");
    for (const model of models.models) {
      console.log(`- ${model.name}`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
