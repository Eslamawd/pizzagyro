import { NextResponse } from "next/server";

const BASE_URL = "https://nominatim.openstreetmap.org/reverse";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const language = searchParams.get("language") || "en";

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Missing required parameters: lat, lon" },
        { status: 400 },
      );
    }

    const upstreamUrl = new URL(BASE_URL);
    upstreamUrl.searchParams.set("format", "json");
    upstreamUrl.searchParams.set("lat", lat);
    upstreamUrl.searchParams.set("lon", lon);
    upstreamUrl.searchParams.set("accept-language", language);

    const response = await fetch(upstreamUrl.toString(), {
      headers: {
        "User-Agent": "PizzaGyroParty/1.0 (support@pizzagyroparty.local)",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to reverse geocode" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Reverse geocode failed" },
      { status: 500 },
    );
  }
}
