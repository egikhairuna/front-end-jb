import { Metadata } from "next";
import { ReturnsRefundsClient } from "./ReturnsRefundsClient";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: "Learn about James Boogie's return and refund policy. Bilingual (EN/ID) information on exchanges, defects, and return procedures.",
  openGraph: {
    title: "James Boogie",
    description: "Official Returns & Refunds policy for James Boogie.",
  },
};

export default function ReturnsRefundsPage() {
  return <ReturnsRefundsClient />;
}
