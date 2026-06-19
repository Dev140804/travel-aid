"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Trip = {
  id: string;
  destination: string;
  days: number;
  createdAt: string;
};

export default function RecentTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trips")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTrips(data);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse text-zinc-500">Loading recent trips...</div>
    );
  }

  if (trips.length === 0) {
    return null; // hide if none
  }

  return (
    <section className="py-20 px-6 lg:px-12 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Recently Saved Trips
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {trips.slice(0, 6).map((trip) => (
            <Link
              key={trip.id}
              href={`/plan-trip?tripId=${trip.id}`}
              className="block p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors shadow-sm cursor-pointer"
            >
              <h3 className="text-xl font-bold mb-2">
                Trip to {trip.destination || "Unknown"}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                {trip.days} Days • Created{" "}
                {new Date(trip.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-4 text-blue-600 dark:text-blue-400 font-medium text-sm flex items-center gap-1">
                View Itinerary
                <span aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
