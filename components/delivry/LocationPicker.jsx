"use client";

import { useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  Autocomplete,
} from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Navigation } from "lucide-react";
import { toast } from "sonner";

// تعريف الاستايل وحجم حاوية الخريطة
const containerStyle = { width: "100%", height: "300px" };

// لازم نعرف المكتبات برة الـ Component عشان نمنع الـ Re-render المتكرر للإسكربت
const GOOGLE_MAPS_LIBRARIES = ["places"];

export default function LocationPicker({ location, setLocation, onClose }) {
  const [coords, setCoords] = useState({
    lat: 36.01244975,
    lng: -86.5487051,
  });

  const [loading, setLoading] = useState(false);

  // Refs للتحكم في الخريطة والـ Autocomplete بتاع جوجل
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  /* LOAD GOOGLE MAPS SCRIPT WITH ENV TOKEN */
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, // هنا بنجيب التوكن من الـ Environment
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

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

  useEffect(() => {
    if (location?.lat && location?.lng) {
      setCoords({ lat: location.lat, lng: location.lng });
    }
  }, [location?.lat, location?.lng]);

  /* REVERSE GEOCODE WITH GOOGLE NATIVE GEOCODER */
  const resolveAddress = (lat, lng) => {
    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          resolve("Your Current Location");
        }
      });
    });
  };

  /* UPDATE LOCATION STATE */
  const updateLocation = async (lat, lng) => {
    const address = await resolveAddress(lat, lng);
    const newLoc = { lat, lng, address, isSet: true };
    setCoords({ lat, lng });
    setLocation(newLoc);
    toast.success(`Updated location: ${address}`);

    // تحريك الكاميرا بسلاسة للمكان المختار
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
    }
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
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const address = await resolveAddress(lat, lng);
        const newLoc = { lat, lng, address, isSet: true };

        setCoords({ lat, lng });
        setLocation(newLoc);

        if (!initial) {
          toast.success(`Updated location: ${address}`);
        }

        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(15);
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

  /* GOOGLE AUTOCOMPLETE PLACE SELECTION */
  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();

      if (!place.geometry || !place.geometry.location) {
        toast.error("Please select a valid location from the list");
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address || "Selected Location";

      const newLoc = { lat, lng, address, isSet: true };
      setCoords({ lat, lng });
      setLocation(newLoc);

      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(16);
      }
      toast.success(`Selected: ${address}`);
    }
  };

  if (loadError)
    return (
      <div className="p-3 text-red-500">
        Error loading maps. Check your API Key.
      </div>
    );
  if (!isLoaded)
    return (
      <div className="h-[300px] bg-slate-50 flex items-center justify-center rounded-2xl border text-sm text-muted-foreground animate-pulse">
        Loading Google Maps...
      </div>
    );

  return (
    <div className="space-y-3">
      {/* SEARCH BOX WITH GOOGLE AUTOCOMPLETE */}
      <div className="relative">
        <Autocomplete
          onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            placeholder="Search your location..."
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </Autocomplete>
      </div>

      {/* GPS BUTTON */}
      <Button
        onClick={() => handleAutoLocate(false)}
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-slate-900 text-white gap-2 flex items-center justify-center"
      >
        <Navigation className="w-4 h-4" />
        {loading ? "Locating..." : "Use my location"}
      </Button>

      {/* MAP */}
      {coords && (
        <div className="h-[300px] rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={coords}
            zoom={15}
            onLoad={(map) => (mapRef.current = map)}
            onClick={(e) => updateLocation(e.latLng.lat(), e.latLng.lng())}
            options={{
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
            }}
          >
            {/* MarkerF لضمان ثبات الدبوس وعدم اختفائه في الـ re-render بتاع React 18 / Next.js */}
            <MarkerF
              position={coords}
              draggable
              onDragEnd={(e) => updateLocation(e.latLng.lat(), e.latLng.lng())}
            />
          </GoogleMap>
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
