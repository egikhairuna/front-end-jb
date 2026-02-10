import { Metadata } from "next";
import { HowToOrderClient } from "./HowToOrderClient";

export const metadata: Metadata = {
  title: "How to Order",
  description: "Learn how to place an order at jamesboogie.com, from browsing products to payment and shipping confirmation.",
  alternates: {
    canonical: "/how-to-order",
  },
  openGraph: {
    title: "How to Order",
    description: "A complete guide to help you shop easily and securely at jamesboogie.com",
    type: "website",
  }
};

export default function HowToOrderPage() {
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Place an Order at James Boogie",
    "description": "A complete guide to help you shop easily and securely at jamesboogie.com",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Select Size and Quantity",
        "text": "Select the desired size and quantity on the product page."
      },
      {
        "@type": "HowToStep",
        "name": "Add to Cart",
        "text": "Add the product to your cart."
      },
      {
        "@type": "HowToStep",
        "name": "Proceed to Checkout",
        "text": "Once you finish shopping, click 'Proceed to Checkout'."
      },
      {
        "@type": "HowToStep",
        "name": "Enter Shipping Details",
        "text": "Enter your email address and shipping details."
      },
      {
        "@type": "HowToStep",
        "name": "Select Methods",
        "text": "Select your shipping and payment methods."
      },
      {
        "@type": "HowToStep",
        "name": "Place Order",
        "text": "Review your information and click 'PLACE ORDER'."
      },
      {
        "@type": "HowToStep",
        "name": "Receive Confirmation",
        "text": "You will receive an order confirmation email with invoice details."
      },
      {
        "@type": "HowToStep",
        "name": "Transfer Payment",
        "text": "Transfer payment to the BCA bank account listed in the invoice."
      },
      {
        "@type": "HowToStep",
        "name": "Send Proof of Payment",
        "text": "Send proof of payment via our WhatsApp contact."
      },
      {
        "@type": "HowToStep",
        "name": "Process and Shipping",
        "text": "Our warehouse will process your order and notify you once it has been shipped."
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <HowToOrderClient />
    </>
  );
}
