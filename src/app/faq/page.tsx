import { Metadata } from "next";
import { FAQClient } from "./FAQClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Find complete answers about ordering, payment, shipping, and return policies for James Boogie e-commerce.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "FAQ",
    description: "Find complete answers about ordering, payment, shipping, and return policies.",
    type: "website",
  }
};

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I place an order?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To place an order, please click here. Make sure to fill in your personal details correctly to avoid delivery issues."
        }
      },
      {
        "@type": "Question",
        "name": "How can I track my order?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Once you receive the tracking number via WhatsApp, you can track your shipment on the official JNE website using the provided tracking number."
        }
      },
      {
        "@type": "Question",
        "name": "Where should I make the payment?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Currently, we accept bank transfers (BCA) and PayPal for international payments."
        }
      },
      {
        "@type": "Question",
        "name": "What is the payment deadline?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The payment deadline is 2 hours. Orders not paid within this time frame will be automatically canceled."
        }
      },
      {
        "@type": "Question",
        "name": "How do I confirm my payment?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Please click here to confirm your payment."
        }
      },
      {
        "@type": "Question",
        "name": "Which courier services are used?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Domestic shipping is handled by JNE, while international shipping uses TLX."
        }
      },
      {
        "@type": "Question",
        "name": "When will my order be shipped?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Orders are shipped after payment confirmation, within a maximum of 24 hours. Shipping may occur on the same day or the next business day."
        }
      },
      {
        "@type": "Question",
        "name": "How much is the shipping cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Shipping costs are automatically calculated based on order quantity and weight."
        }
      },
      {
        "@type": "Question",
        "name": "How do I receive the tracking number?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The tracking number will be sent via WhatsApp one day after the order is processed."
        }
      },
      {
        "@type": "Question",
        "name": "What is the return or exchange policy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Click here to view the complete return and exchange policy."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FAQClient />
    </>
  );
}
