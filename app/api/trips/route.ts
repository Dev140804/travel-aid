import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";

export const dynamic = 'force-dynamic';

// Simple file-based storage for trips
const dataFile = path.join(process.cwd(), "trips.json");

// Ensure file exists
async function ensureDb() {
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify({}));
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const id = uuidv4();
    
    await ensureDb();
    const fileData = await fs.readFile(dataFile, "utf-8");
    const trips = JSON.parse(fileData);
    
    trips[id] = { ...data, createdAt: new Date().toISOString() };
    
    await fs.writeFile(dataFile, JSON.stringify(trips));
    
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: "Failed to save trip" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    await ensureDb();
    const fileData = await fs.readFile(dataFile, "utf-8");
    const trips = JSON.parse(fileData);

    if (id) {
      if (trips[id]) {
        return NextResponse.json(trips[id]);
      } else {
        return NextResponse.json({ error: "Trip not found" }, { status: 404 });
      }
    }

    // Return list of all trips (for home page)
    const tripList = Object.keys(trips).map(key => ({
      id: key,
      destination: trips[key].destination,
      days: trips[key].days,
      createdAt: trips[key].createdAt,
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(tripList);

  } catch {
    return NextResponse.json({ error: "Failed to get trips" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Trip ID is required" }, { status: 400 });
  }

  try {
    await ensureDb();
    const fileData = await fs.readFile(dataFile, "utf-8");
    const trips = JSON.parse(fileData);

    if (!trips[id]) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    delete trips[id];
    await fs.writeFile(dataFile, JSON.stringify(trips));

    return NextResponse.json({ success: true, message: "Trip deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
  }
}