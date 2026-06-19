import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sourceLat = searchParams.get("sourceLat");
    const sourceLng = searchParams.get("sourceLng");
    const destLat = searchParams.get("destLat");
    const destLng = searchParams.get("destLng");
    const mode = searchParams.get("mode") || "driving";

    if (!sourceLat || !sourceLng || !destLat || !destLng) {
      return NextResponse.json(
        { error: "Missing coordinates" },
        { status: 400 }
      );
    }

    // Map transit modes to Google Maps travel modes
    const modeMap: Record<string, string> = {
      flight: "driving",
      train: "transit",
      car: "driving",
      personal: "driving",
      bus: "transit",
      walk: "walking",
    };

    const googleMode = modeMap[mode.toLowerCase()] || "driving";

    const origin = `${sourceLat},${sourceLng}`;
    const destination = `${destLat},${destLng}`;

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&mode=${googleMode}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.statusText}`);
    }

    const data = await response.json();

    console.log("Google Maps Distance Matrix Response:", {
      status: data.status,
      rowsLength: data.rows?.length,
      elementsLength: data.rows?.[0]?.elements?.length,
      firstElement: data.rows?.[0]?.elements?.[0],
      errorMessage: data.error_message,
    });

    if (data.status !== "OK") {
      console.error("Google Maps API Error:", {
        status: data.status,
        message: data.error_message,
        requestUrl: `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&mode=${googleMode}`,
      });
      return NextResponse.json(
        { 
          error: `Google Maps API error: ${data.status}`, 
          details: data.error_message,
          hint: data.status === "REQUEST_DENIED" ? "Distance Matrix API may not be enabled in your GCP project. Enable it in Google Cloud Console." : null,
        },
        { status: 400 }
      );
    }

    if (!data.rows[0]?.elements[0]) {
      return NextResponse.json(
        { error: "No route found", details: "No elements in response" },
        { status: 404 }
      );
    }

    const element = data.rows[0].elements[0];

    if (element.status !== "OK") {
      return NextResponse.json(
        { error: `Route not available: ${element.status}`, details: element },
        { status: 404 }
      );
    }

    const distanceMeters = element.distance.value;
    const durationSeconds = element.duration.value;

    // Convert to miles
    const distanceMiles = (distanceMeters / 1609.34).toFixed(1);
    
    // Format time duration display
    const durationHours = Math.floor(durationSeconds / 3600);
    const durationMinutes = Math.round((durationSeconds % 3600) / 60);

    let timeDisplay = "";
    if (durationHours > 0) {
      if (durationMinutes > 0) {
        timeDisplay = `~${durationHours}h ${durationMinutes}m`;
      } else {
        timeDisplay = durationHours === 1 ? "~1 hr" : `~${durationHours} hrs`;
      }
    } else {
      timeDisplay = `~${durationMinutes} min`;
    }

    return NextResponse.json({
      distance: distanceMiles,
      time: timeDisplay,
      durationSeconds,
    });
  } catch (error) {
    console.error("Travel distance error:", error);
    return NextResponse.json(
      {
        error: "Failed to calculate travel distance",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
