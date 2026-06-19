/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url);
  const destination = searchParams.get("destination");
  const specificHotel = searchParams.get("hotel");
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!destination) {
    return NextResponse.json({ error: "Destination missing" }, { status: 400 });
  }

  try {
    if (specificHotel) {
      // Find the specific hotel
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(specificHotel + ' in ' + destination)}&key=${apiKey}`;
      const res = await fetch(url, { next: { revalidate: 86400 } });
      const data = await res.json();
      
      const hotels = data?.results?.slice(0, 5).map((h: any) => ({
        name: h.name,
        rating: h.rating || 4.0,
        photo_reference: h.photos?.[0]?.photo_reference || null,
        location: h.geometry?.location || null
      })) || [];
      return NextResponse.json(hotels);
    }

    // Get coordinates
    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${apiKey}`,
      { next: { revalidate: 86400 } }
    );

    const geoData = await geoRes.json();
    const location = geoData.results[0]?.geometry?.location;

    if (!location) {
        return NextResponse.json([]);
    }

    const lat = location.lat;
    const lng = location.lng;

    // Search nearby hotels
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=lodging&key=${apiKey}`,
      { next: { revalidate: 86400 } }
    );

    const data = await res.json();

    const hotels = data.results.slice(0, 5).map((h: any) => ({
      name: h.name,
      rating: h.rating || 4.0,
      photo_reference: h.photos?.[0]?.photo_reference || null,
      location: h.geometry?.location || null
    }));

    return NextResponse.json(hotels);

  } catch (error) {

    console.error(error);

    return NextResponse.json([]);

  }

}