import { Navbar } from "@/components/layout/Navbar";
import { fetchGraphQL } from "@/lib/graphql/server-client";
import { GET_PRODUCT } from "@/lib/graphql/queries";
import { Product } from "@/types/woocommerce";
import { ProductDetailClient } from "./product-client";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// ⚡ Global ISR: Individual products revalidate every 1h
export const revalidate = 3600;

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
  try {
    const data: any = await fetchGraphQL(GET_PRODUCT, {
      id: slug,
      idType: "SLUG"
    }, {
      revalidate: 3600,
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
  } catch (e) {
    return { title: "James Boogie Product" };
  }
}

async function getProduct(slug: string) {
    try {
        const data: any = await fetchGraphQL(GET_PRODUCT, {
            id: slug,
            idType: "SLUG"
        }, {
            revalidate: 3600,
            tags: [`product-${slug}`]
        });
        return data.product as Product;
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound(); 
  }

  return (
    <>
      <Navbar />
      <ProductDetailClient product={product} />
    </>
  );
}
