import { NextResponse } from "next/server";

const BASE_URL = "https://nominatim.openstreetmap.org/search";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const language = searchParams.get("language") || "en";
    const limit = searchParams.get("limit") || "5";

    if (!query) {
      return NextResponse.json(
        { error: "Missing required parameter: q" },
        { status: 400 },
      );
    }

    const upstreamUrl = new URL(BASE_URL);
    upstreamUrl.searchParams.set("format", "json");
    upstreamUrl.searchParams.set("q", query);
    upstreamUrl.searchParams.set("accept-language", language);
    upstreamUrl.searchParams.set("limit", limit);

    const response = await fetch(upstreamUrl.toString(), {
      headers: {
        "User-Agent": "PizzaGyroParty/1.0 (support@pizzagyroparty.local)",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to search geocode" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Geocode search failed" },
      { status: 500 },
    );
  }
}
