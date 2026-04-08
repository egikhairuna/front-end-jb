import { permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>
}

export default async function ProductRedirectPage({ params }: Props) {
  const { slug } = await params;
  
  // 301 Permanent Redirect to the new path-based product URL
  permanentRedirect(`/product/${slug}`);
}
