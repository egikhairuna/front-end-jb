"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import * as fp from "@/lib/metaPixel";

export const FacebookPixel = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    fp.pageview();
  }, [pathname, searchParams]);

  return null;
};
