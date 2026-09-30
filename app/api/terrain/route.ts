import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json({ error: "lat/lng required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("GOOGLE_MAPS_API_KEY missing for terrain lookup");
      return NextResponse.json({ isHilly: false, reason: "no-api-key" });
    }

    // sample center and 4 offsets (~1.5-2.5 km) to approximate nearby terrain variation
    const offsets = [0, 0.015, -0.015];
    const pts: string[] = [];
    for (let dx of offsets) {
      for (let dy of offsets) {
        const latp = Number(lat) + dx;
        const lngp = Number(lng) + dy;
        pts.push(`${latp},${lngp}`);
      }
    }

    const locations = pts.join("|");
    const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${encodeURIComponent(locations)}&key=${apiKey}`;

    const resp = await fetch(url);
    if (!resp.ok) {
      console.error("Elevation API error", resp.statusText);
      return NextResponse.json({ isHilly: false, reason: "elevation-failed" });
    }

    const data = await resp.json();
    const results = data.results || [];
    const elevations = results.map((r: any) => r.elevation).filter((e: any) => typeof e === 'number');
    if (!elevations.length) {
      return NextResponse.json({ isHilly: false, reason: 'no-elevations' });
    }

    const max = Math.max(...elevations);
    const min = Math.min(...elevations);
    const mean = elevations.reduce((s: number, v: number) => s + v, 0) / elevations.length;

    // Heuristic: consider hilly if elevation difference nearby significant OR mean elevation moderately high
    const elevDiff = max - min;
    const isHilly = elevDiff >= 100 || mean >= 300;

    return NextResponse.json({ isHilly, elevations: { max, min, mean, elevDiff } });
  } catch (err) {
    console.error("terrain error", err);
    return NextResponse.json({ isHilly: false, reason: 'error' });
  }
}
