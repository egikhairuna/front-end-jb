import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { MarketingGrid } from "@/components/home/MarketingGrid";
import { client } from "@/lib/graphql/client";
import { GET_PRODUCTS } from "@/lib/graphql/queries";
import { Product } from "@/types/woocommerce";

// Enhanced SEO metadata for homepage
export const metadata: Metadata = {
  title: "James Boogie",
  description: "Discover James Boogie's premium Pop Military streetwear collection. Explore our latest fashion pieces blending military with contemporary street style. Shop online or visit our flagship store.",
  openGraph: {
    title: "James Boogie",
    description: "Discover James Boogie's premium Pop Military streetwear collection. Explore our latest fashion pieces blending military aesthetics with contemporary street style.",
    url: "https://jamesboogie.com",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "James Boogie",
      },
    ],
  },

  alternates: {
    canonical: "https://jamesboogie.com",
  },
};

// Helper function to fetch data
async function getFeaturedProducts() {
  try {
    const data: any = await client.request(GET_PRODUCTS, { first: 8 });
    return data.products.nodes as Product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// JSON-LD Structured Data for Organization
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  "name": "James Boogie",
  "description": "Premium Pop Military streetwear brand",
  "url": "https://jamesboogie.com",
  "logo": "https://jamesboogie.com/logo.png",
  "image": "https://jamesboogie.com/og-image.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Gambir Saketi 44 street",
    "addressLocality": "Bandung",
    "addressRegion": "West Java",
    "postalCode": "40123",
    "addressCountry": "ID"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -6.895183167477032,
    "longitude": 107.62682587573929
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ],
    "opens": "10:00",
    "closes": "21:00"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+62-851-5700-0263",
    "contactType": "Customer Service",
    "availableLanguage": ["English", "Indonesian"]
  },
  "sameAs": [
    "https://instagram.com/jamesboogie",
    "https://facebook.com/jamesboogie"
  ]
};

export default async function Home() {
  const products = await getFeaturedProducts();

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      
      <Navbar />
      <Hero />
      <ProductCarousel />
      <MarketingGrid />
    </>
  );
}
