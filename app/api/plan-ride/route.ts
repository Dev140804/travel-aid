import { NextResponse } from "next/server";
import { generateMockVehiclePlan, buildVehiclePrompt } from "@/lib/vehicleRidePlanner";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // For prototype, return a mock plan rather than calling an LLM
    const prompt = buildVehiclePrompt(body);
    console.log("Vehicle plan request prompt:", prompt);

    const plan = await generateMockVehiclePlan(body);
    return NextResponse.json(plan);
  } catch (error) {
    console.error("Plan-ride error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to generate vehicle plan", details: message }, { status: 500 });
  }
}
