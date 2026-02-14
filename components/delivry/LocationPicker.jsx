"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Navigation } from "lucide-react";
import { toast } from "sonner";

/* FIX MARKER */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function LocationPicker({ location, setLocation, onClose }) {
  const [coords, setCoords] = useState({
    lat: 36.01244975,
    lng: -86.5487051,
  });

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeout = useRef(null);

  /* LOAD FROM STATE / STORAGE */
  useEffect(() => {
    if (location?.lat && location?.lng) {
      setCoords({
        lat: location.lat,
        lng: location.lng,
      });
    } else {
      handleAutoLocate(true);
    }
  }, []);

  /* REVERSE GEOCODE */
  const resolveAddress = async (lat, lon) => {
    try {
      const res = await fetch(
        `/api/geocode/reverse?lat=${lat}&lon=${lon}&language=en`,
      );
      const a = (await res.json()).address || {};
      return (
        a.neighbourhood ||
        a.suburb ||
        a.city_district ||
        a.town ||
        a.city ||
        "Your Current Location"
      );
    } catch {
      return "Your Current Location";
    }
  };

  /* UPDATE LOCATION STATE */
  const updateLocation = async (lat, lng) => {
    const address = await resolveAddress(lat, lng);
    const newLoc = { lat, lng, address, isSet: true };
    setCoords({ lat, lng });
    setLocation(newLoc);
    toast.success(`Updated location: ${address}`);
  };

  /* CONFIRM → API */
  const confirmLocation = async () => {
    try {
      await fetch("/api/user/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(location),
      });
      toast.success("Location saved successfully");
      onClose();
    } catch {
      toast.error("Failed to save location");
    }
  };

  /* AUTO GPS */
  const handleAutoLocate = (initial = false) => {
    if (!navigator.geolocation) {
      toast.error(" Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        let address = "موقعك الحالي";
        try {
          const res = await fetch(
            `/api/geocode/reverse?lat=${lat}&lon=${lng}&language=en`,
          );
          const data = await res.json();
          const a = data.address || {};
          address =
            a.neighbourhood ||
            a.suburb ||
            a.city_district ||
            a.town ||
            a.city ||
            "Your Current Location";
        } catch {}

        const newLoc = { lat, lng, address, isSet: true };

        if (initial) {
          setLocation(newLoc);
          setCoords({ lat, lng });
        } else {
          setCoords({ lat, lng });
          setLocation(newLoc);
          toast.success(`Updated location: ${address}`);
        }

        setLoading(false);
      },
      () => {
        toast.error("Please enable GPS");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  /* MAP CLICK */
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        updateLocation(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  /* SEARCH LOCATIONS */
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(async () => {
      if (!query) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await fetch(
          `/api/geocode/search?q=${encodeURIComponent(query)}&language=en&limit=5`,
        );
        const data = await res.json();
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      }
    }, 300); // ← debounce
  };

  const selectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    updateLocation(lat, lng);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="space-y-3">
      {/* SEARCH BOX */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search your location..."
          className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        {searchResults.length > 0 && (
          <ul className="absolute z-999 w-full bg-white border border-gray-300 rounded-xl max-h-60 overflow-auto mt-1">
            {searchResults.map((r) => (
              <li
                key={r.place_id}
                onClick={() => selectSearchResult(r)}
                className="p-2 hover:bg-orange-100 cursor-pointer"
              >
                {r.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* GPS BUTTON */}
      <Button
        onClick={() => handleAutoLocate(false)}
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-slate-900 text-white gap-2 flex items-center justify-center"
      >
        <Navigation />
        {loading ? "Locating..." : "Use my location"}
      </Button>

      {/* MAP */}
      {coords && (
        <div className="h-[300px] rounded-2xl overflow-hidden">
          <MapContainer
            center={[coords.lat, coords.lng]}
            zoom={15}
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker
              position={[coords.lat, coords.lng]}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const p = e.target.getLatLng();
                  updateLocation(p.lat, p.lng);
                },
              }}
            />
            <MapEvents />
          </MapContainer>
        </div>
      )}

      {/* CONFIRM BUTTON */}
      <Button
        onClick={confirmLocation}
        disabled={!location?.isSet}
        className="w-full py-5 rounded-2xl bg-orange-500 text-white font-black"
      >
        Confirm Location
      </Button>
    </div>
  );
}
