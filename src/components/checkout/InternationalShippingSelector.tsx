// src/components/checkout/InternationalShippingSelector.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { ShippingOption } from "@/types/woocommerce";
import { COUNTRIES } from "@/constants/countries";
import { formatPrice } from "@/lib/currency/config";

interface InternationalShippingSelectorProps {
  countryName: string;
  weightGrams: number;
  onShippingResolved: (option: ShippingOption | null, countryId: string | null) => void;
  disabled?: boolean;
  checkoutCurrency?: 'IDR' | 'USD';
}

export function InternationalShippingSelector({
  countryName,
  weightGrams,
  onShippingResolved,
  disabled = false,
  checkoutCurrency = 'USD',
}: InternationalShippingSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingOption, setShippingOption] = useState<ShippingOption | null>(null);
  const [resolvedCountryId, setResolvedCountryId] = useState<string | null>(null);

  // Keep reference to the latest callback to avoid infinite loops from parent renders
  const onShippingResolvedRef = useRef(onShippingResolved);
  useEffect(() => {
    onShippingResolvedRef.current = onShippingResolved;
  }, [onShippingResolved]);

  useEffect(() => {
    let active = true;

    if (!countryName || countryName === "Indonesia") {
      setShippingOption(null);
      setResolvedCountryId(null);
      onShippingResolvedRef.current(null, null);
      return;
    }

    async function fetchInternationalRates() {
      setLoading(true);
      setError(null);
      setShippingOption(null);
      setResolvedCountryId(null);
      onShippingResolvedRef.current(null, null);

      try {
        // 1. Resolve country name statically to RajaOngkir country_id
        const matched = COUNTRIES.find(
          (c) => c.name.toLowerCase() === countryName.toLowerCase()
        );

        if (!matched || !matched.rajaOngkirId || matched.rajaOngkirId === "0") {
          throw new Error(`Country "${countryName}" is not supported for international shipping`);
        }

        const countryId = matched.rajaOngkirId;

        if (!active) return;
        setResolvedCountryId(countryId);

        // 2. Fetch shipping cost
        const costRes = await fetch("/api/shipping/cost/international", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            countryId,
            weightGrams,
          }),
        });

        if (!costRes.ok) {
          throw new Error("Failed to calculate international shipping cost");
        }

        const costData = await costRes.json();

        if (!Array.isArray(costData) || costData.length === 0) {
          throw new Error("No international shipping services available for this destination");
        }

        const resolvedOption: ShippingOption = costData[0]; // pick JNE Paket

        if (!active) return;
        setShippingOption(resolvedOption);
        onShippingResolvedRef.current(resolvedOption, countryId);
      } catch (err: any) {
        if (!active) return;
        console.error("International shipping resolution error:", err);
        setError(err?.message || "Failed to resolve shipping rates");
        onShippingResolvedRef.current(null, null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchInternationalRates();

    return () => {
      active = false;
    };
  }, [countryName, weightGrams]);

  if (countryName === "Indonesia") return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-wider mb-2 mt-6 border-t border-black pt-4">
        Shipping Method (International JNE)
      </h2>

      {loading && (
        <div className="text-xs italic py-2 text-gray-500">
          Resolving international destination and shipping rates...
        </div>
      )}

      {error && (
        <div className="p-3 border border-red-300 bg-red-50 text-xs text-red-600 rounded-sm">
          {error}
        </div>
      )}

      {shippingOption && !loading && (
        <div className="flex items-center justify-between p-4 border border-black bg-black/5">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border border-black flex items-center justify-center bg-black">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <div>
              <div className="text-sm font-bold uppercase">
                {shippingOption.service}
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {shippingOption.description} ({shippingOption.etd_from}-{shippingOption.etd_thru} Days)
              </div>
            </div>
          </div>
          <div className="text-sm font-bold">
            {formatPrice(shippingOption.price, checkoutCurrency)}
          </div>
        </div>
      )}
    </section>
  );
}
