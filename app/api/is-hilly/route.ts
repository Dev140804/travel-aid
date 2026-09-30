import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const destination = searchParams.get("destination");

    if (!destination) {
      return NextResponse.json({ error: "destination required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("GOOGLE_MAPS_API_KEY missing for is-hilly lookup");
      return NextResponse.json({ isHilly: false, reason: "no-api-key" });
    }

    // Geocode the destination to get lat/lng
    const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${apiKey}`;
    const geoRes = await fetch(geoUrl, { next: { revalidate: 86400 } });
    if (!geoRes.ok) {
      console.error("Geocode failed", geoRes.statusText);
      return NextResponse.json({ isHilly: false, reason: "geocode-failed" });
    }

    const geoData = await geoRes.json();
    const loc = geoData.results?.[0]?.geometry?.location;
    if (!loc) {
      return NextResponse.json({ isHilly: false, reason: "no-geometry" });
    }

    const lat = loc.lat;
    const lng = loc.lng;

    // Reuse existing terrain endpoint server-side using request origin
    const origin = new URL(req.url).origin;
    const terrainRes = await fetch(`${origin}/api/terrain?lat=${lat}&lng=${lng}`);
    if (terrainRes.ok) {
      const terrain = await terrainRes.json();
      return NextResponse.json({ isHilly: !!terrain?.isHilly, details: terrain, lat, lng });
    }

    // Fallback: call elevation API directly
    const elevationsUrl = `https://maps.googleapis.com/maps/api/elevation/json?locations=${encodeURIComponent(`${lat},${lng}`)}&key=${apiKey}`;
    const elevRes = await fetch(elevationsUrl);
    if (!elevRes.ok) {
      return NextResponse.json({ isHilly: false, reason: "elevation-failed" });
    }
    const elevData = await elevRes.json();
    const elev = elevData.results?.[0]?.elevation;
    const isHilly = typeof elev === 'number' && elev >= 300; // fallback heuristic

    return NextResponse.json({ isHilly, lat, lng, elevations: elevData.results || [] });
  } catch (err) {
    console.error("is-hilly error", err);
    return NextResponse.json({ isHilly: false, reason: 'error' });
  }
}
