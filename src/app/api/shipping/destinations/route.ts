// src/app/api/shipping/destinations/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    if (!search || search.length < 3) {
      return NextResponse.json([]);
    }

    const res = await fetch(
      `https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=${encodeURIComponent(
        search
      )}&limit=20&offset=0`,
      {
        headers: {
          key: process.env.RAJAONGKIR_API_KEY!,
        },
        cache: "no-store",
      }
    );

    const json = await res.json();

    // FRONTEND EXPECT ARRAY, BUKAN OBJECT
    return NextResponse.json(json.data || []);
  } catch (e) {
    return NextResponse.json([], { status: 500 });
  }
}
