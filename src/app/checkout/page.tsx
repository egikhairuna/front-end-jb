import { Metadata } from 'next';
import { Navbar } from "@/components/layout/Navbar";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <div className="w-full px-4 md:px-8 lg:px-12 py-10">
        <h1 className="text-3xl font-bold font-heading mb-8">Checkout</h1>
        <CheckoutForm />
      </div>
    </>
  );
}
