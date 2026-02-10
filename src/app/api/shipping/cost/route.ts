import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const destination = body.destination ?? body.destination_id;
    const origin = body.origin ?? body.origin_id; // wajib ada
    const weight = body.weight;
    const courier = body.courier ?? "jne";

    if (!origin || !destination || !weight || !courier) {
      return NextResponse.json(
        {
          error: "Missing required params",
          received: { origin, destination, weight, courier },
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.RAJAONGKIR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "RAJAONGKIR_API_KEY not set" },
        { status: 500 }
      );
    }

    // Komerce butuh x-www-form-urlencoded
    const form = new URLSearchParams();
    form.append("origin", String(origin));
    form.append("destination", String(destination));
    form.append("weight", String(weight));
    form.append("courier", String(courier));
    // optional:
    // form.append("price", "lowest");

    const res = await fetch(
      "https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost",
      {
        method: "POST",
        headers: {
          key: apiKey,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      }
    );

    const json = await res.json();

    if (!res.ok) {
      console.error("Komerce JSON error:", json);
      return NextResponse.json(
        { error: "Komerce error", detail: json },
        { status: res.status }
      );
    }

    return NextResponse.json(json.data || []);
  } catch (err: any) {
    console.error("Shipping cost route error:", err);
    return NextResponse.json(
      { error: "Internal error", detail: err?.message || String(err) },
      { status: 500 }
    );
  }
}
