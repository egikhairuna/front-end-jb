import { Metadata } from 'next';
import { Navbar } from "@/components/layout/Navbar";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { getSession } from '@/lib/auth/session';
import { getWooCommerceClient } from '@/lib/woocommerce/client';

export const metadata: Metadata = {
  title: "Checkout",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutPage() {
  // Try to get session and saved addresses for logged-in users
  let savedAddresses: { billing?: any; shipping?: any } | undefined;

  try {
    const session = await getSession();
    if (session) {
      const wc = getWooCommerceClient();
      const customer = await wc.getCustomer(session.id);

      // Only pass addresses if they have meaningful data
      const hasBilling = customer.billing?.first_name || customer.billing?.address_1;
      const hasShipping = customer.shipping?.first_name || customer.shipping?.address_1;

      if (hasBilling || hasShipping) {
        savedAddresses = {
          billing: hasBilling ? customer.billing : undefined,
          shipping: hasShipping ? customer.shipping : undefined,
        };
      }
    }
  } catch {
    // Non-critical: if session check fails, guest checkout still works
  }

  return (
    <>
      <Navbar />
      <div className="w-full px-4 md:px-8 lg:px-12 py-10">
        <h1 className="text-3xl font-bold font-heading mb-8">Checkout</h1>
        <CheckoutForm savedAddresses={savedAddresses} />
      </div>
    </>
  );
}
