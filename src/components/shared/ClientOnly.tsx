"use client";

import { useEffect, useState } from "react";

/**
 * Ensures that children are only rendered on the client.
 * This prevents hydration mismatches for components that depend 
 * on window, document, or other browser-only state.
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
