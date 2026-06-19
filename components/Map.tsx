"use client";

import { useMemo } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  Polyline,
} from "@react-google-maps/api";

type Location = {
  lat: number;
  lng: number;
  name: string;
};

type Props = {
  apiKey: string;
  locations: Location[];
};

export default function MapView({ apiKey, locations }: Props) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  const center = useMemo(() => {
    if (!locations || locations.length === 0) return { lat: 0, lng: 0 };
    return { lat: locations[0].lat, lng: locations[0].lng };
  }, [locations]);

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      mapId: "TRIP_PLANNER_MAP_ID", // Optional
    }),
    [],
  );

  const pathCoordinates = locations.map((loc) => ({
    lat: loc.lat,
    lng: loc.lng,
  }));

  if (!isLoaded)
    return (
      <div className="w-full h-full bg-slate-800 animate-pulse rounded-xl flex items-center justify-center">
        Loading Map...
      </div>
    );
  if (!locations || locations.length === 0)
    return (
      <div className="w-full h-full bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
        Pick a day to view the map
      </div>
    );

  return (
    <GoogleMap
      options={mapOptions}
      zoom={12}
      center={center}
      mapContainerClassName="w-full h-full rounded-xl"
    >
      {locations.map((loc, index) => (
        <Marker
          key={index}
          position={{ lat: loc.lat, lng: loc.lng }}
          title={loc.name}
          label={(index + 1).toString()}
        />
      ))}
      {locations.length > 1 && (
        <Polyline
          path={pathCoordinates}
          options={{
            strokeColor: "#3b82f6",
            strokeOpacity: 0.8,
            strokeWeight: 3,
          }}
        />
      )}
    </GoogleMap>
  );
}
