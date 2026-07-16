// src/app/api/shipping/cost/international/route.ts
import { NextResponse } from "next/server";
import { calculateInternationalCost } from "@/lib/rajaongkir";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { countryId, weightGrams } = body;

    if (!countryId || weightGrams === undefined) {
      return NextResponse.json(
        {
          error: "Missing required parameters",
          received: { countryId, weightGrams },
        },
        { status: 400 }
      );
    }

    const options = await calculateInternationalCost(countryId, weightGrams);

    return NextResponse.json(options);
  } catch (err: any) {
    console.error("Error in international shipping cost API route:", err);
    return NextResponse.json(
      { error: "Failed to calculate international shipping cost", detail: err?.message || String(err) },
      { status: 500 }
    );
  }
}
