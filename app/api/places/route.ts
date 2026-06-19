/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export async function GET(req: Request) {

  try {

    const { searchParams } = new URL(req.url);
    const destination = searchParams.get("destination");

    if (!destination) {
      return NextResponse.json({ error: "Destination missing" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    const url =
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=tourist+attractions+in+${destination}&key=${apiKey}`;

    const response = await fetch(url, { next: { revalidate: 86400 } });

    const data = await response.json();

    const places =
      data?.results?.slice(0, 15).map((place: any) => ({
        name: place.name,
        rating: place.rating ?? 4.0,
        photo_reference: place.photos?.[0]?.photo_reference || null,
        location: place.geometry?.location || null
      })) || [];

    return NextResponse.json(places);

  } catch (error) {

    console.error("PLACES API ERROR:", error);

    return NextResponse.json([]);

  }
}