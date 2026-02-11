"use client";

import { usePathname } from "next/navigation";

interface ConditionalNavbarProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that conditionally renders its children (the Navbar)
 * based on the current route.
 */
export function ConditionalNavbar({ children }: ConditionalNavbarProps) {
  const pathname = usePathname();

  // Define routes where the Navbar should be hidden
  const hideNavbarRoutes = ["/links"];

  // If the current path is in the exclusion list, don't render the Navbar
  if (hideNavbarRoutes.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
