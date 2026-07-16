// src/lib/rajaongkir.ts

export interface InternationalShippingOption {
  service: string;
  description: string;
  price: number;
  etd_from: string;
  etd_thru: string;
}

interface KomerceFlatShippingItem {
  name?: string;
  code?: string;
  service?: string;
  description?: string;
  currency?: string;
  cost?: number;
  etd?: string;
}

interface RajaOngkirCostDetail {
  value?: number;
  etd?: string;
  note?: string;
}

interface RajaOngkirCostItem {
  service?: string;
  description?: string;
  cost?: RajaOngkirCostDetail[];
}

interface RajaOngkirCourierItem {
  code?: string;
  name?: string;
  costs?: RajaOngkirCostItem[];
}

function parseEtd(etd: string): { etd_from: string; etd_thru: string } {
  if (!etd) {
    return { etd_from: "5", etd_thru: "10" }; // reasonable fallback for international shipping
  }
  // Clean string (e.g. remove "hari", "days", "day", etc.)
  const clean = etd.toLowerCase().replace(/days|day|hari/g, "").trim();
  const parts = clean.split("-").map((p) => p.trim());
  if (parts.length === 2 && parts[0] && parts[1]) {
    return { etd_from: parts[0], etd_thru: parts[1] };
  } else if (parts.length === 1 && parts[0]) {
    return { etd_from: parts[0], etd_thru: parts[0] };
  }
  return { etd_from: "5", etd_thru: "10" };
}

export async function calculateInternationalCost(
  countryId: string | number,
  weightGrams: number
): Promise<InternationalShippingOption[]> {
  const apiKey = process.env.RAJAONGKIR_API_KEY;
  const originId = process.env.RAJAONGKIR_ORIGIN_ID || "4816"; // fallback to Bandung subdistrict ID

  if (!apiKey) {
    throw new Error("RAJAONGKIR_API_KEY is not configured in environment variables");
  }

  // Weight must be at least 1 gram
  const weight = Math.max(1, weightGrams);

  const form = new URLSearchParams();
  form.append("origin", String(originId));
  form.append("destination", String(countryId));
  form.append("weight", String(weight));
  form.append("courier", "jne");
  form.append("price", "lowest");

  const res = await fetch(
    "https://rajaongkir.komerce.id/api/v1/calculate/international-cost",
    {
      method: "POST",
      headers: {
        key: apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
      cache: "no-store",
    }
  );

  const json = await res.json();

  if (!res.ok) {
    console.error("RajaOngkir Komerce international-cost API error:", json);
    throw new Error(json.message || "Failed to fetch international shipping cost from RajaOngkir");
  }

  const data = json.data || [];

  // 1. Komerce Flat Response structure support (observed in testing)
  // Example item: { name: "...", code: "jne", service: "INTL Service", description: "Paket", cost: 610000, etd: "5-6 day" }
  if (Array.isArray(data) && data.length > 0 && typeof data[0].cost === "number") {
    const jnePaket = (data as KomerceFlatShippingItem[]).filter(
      (item) =>
        item.code?.toLowerCase() === "jne" &&
        item.description?.toLowerCase() === "paket"
    );
    return jnePaket.map((item) => {
      const { etd_from, etd_thru } = parseEtd(item.etd || "");
      return {
        service: item.service || "INTL Service",
        description: "JNE International - Paket",
        price: Number(item.cost || 0),
        etd_from,
        etd_thru,
      };
    });
  }

  // 2. Standard RajaOngkir Nested structure fallback
  // Find JNE courier results (typically data is [{ code: 'jne', costs: [...] }])
  const jneCourier = (data as RajaOngkirCourierItem[]).find(
    (c) => c.code?.toLowerCase() === "jne"
  );

  if (jneCourier && Array.isArray(jneCourier.costs)) {
    const filteredCosts = jneCourier.costs.filter(
      (costItem) => costItem.description?.toLowerCase() === "paket"
    );

    return filteredCosts.map((costItem) => {
      const costDetails = costItem.cost?.[0] || { value: 0, etd: "" };
      const { etd_from, etd_thru } = parseEtd(costDetails.etd || "");
      
      return {
        service: costItem.service || "INTL Service",
        description: "JNE International - Paket",
        price: Number(costDetails.value || 0),
        etd_from,
        etd_thru,
      };
    });
  }

  return [];
}
