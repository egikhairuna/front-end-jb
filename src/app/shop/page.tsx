import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { client } from "@/lib/graphql/client";
import { GET_PRODUCTS, GET_CATEGORIES } from "@/lib/graphql/queries";
import { Product } from "@/types/woocommerce";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { sortProductsByStock } from "@/lib/utils";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse James Boogie's premium Pop Military streetwear collection. From iconic jackets to contemporary street fashion, find your next statement piece.",
  alternates: {
    canonical: "/shop",
  },
};

// Types
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getProducts({ 
  after, 
  category, 
  search, 
  stockStatus,
  first = 12 
}: { 
  after?: string; 
  category?: string; 
  search?: string; 
  stockStatus?: string;
  first?: number;
}) {
   try {
     const categoryFilter = (category === "all-products" || !category) ? null : category;

     const data: any = await client.request(GET_PRODUCTS, {
       first,
       after,
       category: categoryFilter,
       search: search || null,
       stockStatus: stockStatus ? [stockStatus] : null
     });
     return data.products;
   } catch (error) {
     console.error("Error fetching products", error);
     return { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } };
   }
}

async function getCategories() {
    try {
        const data: any = await client.request(GET_CATEGORIES);
        return data.productCategories.nodes;
    } catch (error) {
        return [];
    }
}

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : undefined;
  const category = typeof params.category === 'string' ? params.category : undefined;
  const BATCH_SIZE = 12;

  // 1. Initial attempt: Fetch in-stock products
  let productsData = await getProducts({ search, category, stockStatus: 'IN_STOCK', first: BATCH_SIZE });
  let products: Product[] = productsData.nodes;
  let pageInfo = productsData.pageInfo;
  let currentStockStatus = 'IN_STOCK';
  
  // 2. Automatic Transition: If IN_STOCK ends before the batch is full, 
  // immediately fetch OUT_OF_STOCK items to complete the initial render.
  if (!pageInfo.hasNextPage && products.length < BATCH_SIZE) {
    const remainingCount = BATCH_SIZE - products.length;
    const outOfStockData = await getProducts({ 
      search, 
      category, 
      stockStatus: 'OUT_OF_STOCK', 
      first: remainingCount 
    });

    products = [...products, ...outOfStockData.nodes];
    pageInfo = outOfStockData.pageInfo;
    currentStockStatus = 'OUT_OF_STOCK';
  }
  
  const categories = await getCategories();
  
  // Find active category name
  const activeCategory = category 
    ? categories.find((c: any) => c.slug === category) 
    : null;
  
  const displayTitle = activeCategory ? activeCategory.name : "SHOP";

  // Breadcrumbs
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop", active: !activeCategory },
  ];

  if (activeCategory) {
    breadcrumbItems.push({ 
      label: activeCategory.name, 
      href: `/shop?category=${category}`,
      active: true 
    });
  }


  return (
    <>
      <Navbar />
      <div className="w-full px-6 md:px-8 lg:px-12 py-10">
        <div className="w-full pt-20">
          <div className="mb-8">
            <Breadcrumbs items={breadcrumbItems} className="px-0" />
            <h1 className="text-3xl font-bold font-heading mb-2 uppercase">{displayTitle}</h1>
            {search && <p className="text-muted-foreground">Showing results for &quot;{search}&quot;</p>}
          </div>

          {/* Product Grid */}
          <div className="-mx-6 md:mx-0">
            <ProductGrid 
              key={`${category || 'all'}-${search || 'none'}`}
              initialProducts={products} 
              initialPageInfo={pageInfo}
              category={category}
              search={search}
              initialStockStatus={currentStockStatus}
            />
          </div>
        </div>
      </div>
    </>
  );
}
