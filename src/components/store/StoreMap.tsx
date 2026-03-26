"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-neutral-100 animate-pulse flex items-center justify-center">
      <p className="text-sm text-neutral-400 font-medium tracking-widest uppercase">
        Loading map...
      </p>
    </div>
  ),
});

export function StoreMap() {
  return <Map />;
}
