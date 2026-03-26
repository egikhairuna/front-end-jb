import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "James Boogie | Official Links",
  description: "Connect with James Boogie through our official social media channels and shop categories.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function LinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
