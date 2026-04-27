import { Navbar } from "@/components/layout/Navbar";
import { fetchGraphQL } from "@/lib/graphql/server-client";
import { GET_PRODUCT } from "@/lib/graphql/queries";
import { Product } from "@/types/woocommerce";
import { ProductDetailClient } from "./product-client";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// ⚡ Global ISR: Individual products revalidate every 1h (Disabled for debugging)
export const revalidate = 0; 

// 🚀 Ensure dynamic segments are always attemptable even if not pre-rendered
export const dynamicParams = true;

// Types
type Props = {
  params: Promise<{ slug: string }>
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const data: any = await fetchGraphQL(GET_PRODUCT, {
    id: slug,
    idType: "SLUG"
  }, {
    revalidate: 300, 
    tags: [`product-${slug}`]
  });
  
  const product = data.product as Product;
  
  if (!product) return { title: "Product Not Found" };

  const cleanDescription = (product.shortDescription || product.description || "")
    .replace(/<[^>]*>/g, "")
    .substring(0, 160);

  return {
    title: product.name,
    description: cleanDescription,
    openGraph: {
      title: product.name,
      description: cleanDescription,
      images: product.image?.sourceUrl ? [{ url: product.image.sourceUrl }] : [],
    },
    alternates: {
      canonical: `/product/${slug}`,
    },
  };
}

async function getProduct(slug: string) {
    const data: any = await fetchGraphQL(GET_PRODUCT, {
        id: slug,
        idType: "SLUG"
    }, {
        revalidate: 300, 
        tags: [`product-${slug}`]
    });
    return data.product as Product | null;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  console.log(`🔍 [ProductPage] Rendering for slug: "${slug}"`);
  const product = await getProduct(slug);

  if (!product) {
    console.warn(`⚠️ [ProductPage] Product NOT FOUND in GraphQL for slug: "${slug}"`);
    notFound(); 
  }

  console.log(`✅ [ProductPage] Product FOUND: ${product.name}`);

  // 🏛️ STRUCTURED DATA: JSON-LD Product Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image?.sourceUrl || "",
    "description": (product.shortDescription || product.description || "").replace(/<[^>]*>/g, ""),
    "sku": product.databaseId.toString(),
    "brand": {
      "@type": "Brand",
      "name": "James Boogie"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://jamesboogie.com/product/${slug}`,
      "priceCurrency": "IDR",
      "price": product.rawPrice || "0",
      "availability": product.stockStatus === "IN_STOCK" 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  // 🏛️ STRUCTURED DATA: JSON-LD BreadcrumbList Schema
  // jamesboogie.com > Shop > [Category] > [Product]
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Shop",
        "item": "https://jamesboogie.com/shop"
      },
      ...(product.productCategories?.nodes || []).map((cat, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": cat.name,
        "item": `https://jamesboogie.com/shop/category/${cat.slug}`
      })),
      {
        "@type": "ListItem",
        "position": (product.productCategories?.nodes?.length || 0) + 2,
        "name": product.name,
        "item": `https://jamesboogie.com/product/${slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
