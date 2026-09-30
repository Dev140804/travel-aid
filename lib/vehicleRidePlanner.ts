type VehiclePayload = {
  vehicle: {
    model: string;
    year?: number;
    type?: string;
    lastServiceKm?: number;
    lastServiceDate?: string;
  };
  trip: {
    from?: string;
    to?: string;
    startDate?: string;
    days?: number;
    people?: number;
    avgDailyKm?: number;
  };
  preferences?: {
    experience?: string;
    roadPreference?: string;
    equipment?: string[];
  };
};

export async function generateMockVehiclePlan(payload: VehiclePayload) {
  // This function returns a deterministic mock response suitable for UI prototyping.
  const { vehicle, trip, preferences } = payload;
  const days = trip.days || 2;

  const itinerary = Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    stops: [
      { time: "08:00", activity: `Start from ${trip.from || "your location"}` },
      { time: "11:00", activity: `Midway stop and quick check (fuel/snack)` },
      { time: "17:00", activity: `Arrive near ${trip.to || "destination"} and check-in` },
    ],
    approxKm: trip.avgDailyKm || 250,
  }));

  const checklist = [
    "Full service check: oil, brakes, chain/tyres",
    "Carry toolkit and puncture repair kit",
    "Spare bulbs and a power bank",
    "Confirm tyre pressure and brake pads",
  ];

  const maintenanceReminders = [
    `Last service at ${vehicle.lastServiceKm ?? "N/A"} km — consider full inspection before long ride.`,
    "Top up fluids and check battery/alternator",
  ];

  const warnings = [] as string[];
  if ((vehicle.year && new Date().getFullYear() - vehicle.year > 10) || (vehicle.type?.toLowerCase?.() === "bike" && (preferences?.experience || "").toLowerCase() === "novice")) {
    warnings.push("Older vehicle or novice rider — book a pre-trip mechanic inspection and consider a gentler route.");
  }

  const summary = `Planned ${days}-day ride from ${trip.from || "A"} to ${trip.to || "B"} on a ${vehicle.year || "recent"} ${vehicle.model}.`;

  return {
    summary,
    itinerary,
    checklist,
    maintenanceReminders,
    warnings,
    meta: { generatedAt: new Date().toISOString(), source: "mock" },
  };
}

export function buildVehiclePrompt(payload: VehiclePayload) {
  // Return a human readable prompt for an LLM (for future use)
  const { vehicle, trip, preferences } = payload;
  return `Plan a ${trip.days || "N"}-day vehicle ride from ${trip.from || "start"} to ${trip.to || "destination"}.
Vehicle: ${vehicle.year || "unknown"} ${vehicle.model} (${vehicle.type || "vehicle"}).
Last service: ${vehicle.lastServiceKm ?? "unknown"} km on ${vehicle.lastServiceDate ?? "unknown"}.
Preferences: experience=${preferences?.experience || "any"}, road=${preferences?.roadPreference || "any"}.
Return a JSON with itinerary, checklist, maintenanceReminders, and warnings.`;
}
