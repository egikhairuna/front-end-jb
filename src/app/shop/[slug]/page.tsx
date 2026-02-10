import { Navbar } from "@/components/layout/Navbar";
import { client } from "@/lib/graphql/client";
import { GET_PRODUCT, GET_RELATED_PRODUCTS } from "@/lib/graphql/queries";
import { Product } from "@/types/woocommerce";
import { ProductDetailClient } from "./product-client";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Types
type Props = {
  params: Promise<{ slug: string }>
}

/**
 * 🔍 DYNAMIC SEO METADATA
 * Ensures each product has its own title and description for search engines
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data: any = await client.request(GET_PRODUCT, {
      id: slug,
      idType: "SLUG"
    });
    const product = data.product as Product;
    
    if (!product) return { title: "Product Not Found" };

    // Clean HTML tags from description
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
        const data: any = await client.request(GET_PRODUCT, {
            id: slug,
            idType: "SLUG"
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
