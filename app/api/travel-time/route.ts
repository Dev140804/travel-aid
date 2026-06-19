import { NextResponse } from "next/server";

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url);

  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");

  const key = process.env.GOOGLE_MAPS_API_KEY;

  const url =
  `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&departure_time=now&traffic_model=best_guess&key=${key}`;

  const res = await fetch(url);
  const data = await res.json();

  const element = data.rows[0].elements[0];

  return NextResponse.json({
    distance: element.distance.text,
    duration: element.duration.text,
    durationTraffic: element.duration_in_traffic?.text
  });

}