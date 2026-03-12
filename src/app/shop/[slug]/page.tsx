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

/**
 * 🔍 DYNAMIC SEO METADATA
 * Next.js dedupes this fetch automatically with the same params in the page component.
 */
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

  return (
    <>
      <Navbar />
      <ProductDetailClient product={product} />
    </>
  );
}
