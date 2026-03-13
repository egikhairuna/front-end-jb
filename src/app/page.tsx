import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { Categories } from "@/components/home/Categories";
import { About } from "@/components/home/About";
import { MarketingGrid } from "@/components/home/MarketingGrid";
import { fetchGraphQL } from "@/lib/graphql/server-client";
import { GET_PRODUCTS } from "@/lib/graphql/queries";
import { Product } from "@/types/woocommerce";

export const metadata: Metadata = {
  title: "James Boogie",
  description: "Discover the pop military vibes jackets and clothing, a journey where every detail is refined, every process considered, and James Boogie arrives at its most deliberate point.",
  openGraph: {
    title: "James Boogie",
    description: "Discover the pop military vibes jackets and clothing, a journey where every detail is refined, every process considered, and James Boogie arrives at its most deliberate point.",
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

export const revalidate = 3600;

async function getFeaturedProducts() {
  try {
    const data: any = await fetchGraphQL(GET_PRODUCTS, { first: 8, featured: true }, {
      revalidate: 300,
      tags: ['products', 'featured']
    });
    return data.products.nodes as Product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// JSON-LD Structured Data
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
      "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
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
  // Though currently unused in props, keeping it for data cache warming 
  // and potential future use in ProductCarousel
  const products = await getFeaturedProducts();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      
      <Hero />
      <ProductCarousel products={products} />
      <Categories />
      <About />
      <MarketingGrid />
    </>
  );
}
