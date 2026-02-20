import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { fetchGraphQL } from "@/lib/graphql/server-client";
import { GET_PRODUCTS, GET_CATEGORIES } from "@/lib/graphql/queries";
import { Product } from "@/types/woocommerce";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse James Boogie's premium Pop Military streetwear collection. From iconic jackets to contemporary street fashion, find your next statement piece.",
  alternates: {
    canonical: "/shop",
  },
};

// ⚡ Global ISR config: 10 mins cache for the whole page
export const revalidate = 600;

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

     const data: any = await fetchGraphQL(GET_PRODUCTS, {
       first,
       after,
       category: categoryFilter,
       search: search || null,
       stockStatus: stockStatus ? [stockStatus] : null
     }, {
       // 💿 Fine-grained caching per request
       revalidate: 600,
       tags: ['products', stockStatus || 'all']
     });
     return data.products;
   } catch (error) {
     console.error("Error fetching products", error);
     return { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } };
   }
}

async function getCategories() {
    try {
        const data: any = await fetchGraphQL(GET_CATEGORIES, {}, {
          revalidate: 3600, // Categories change less often
          tags: ['categories']
        });
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

  // 🚀 Eliminate Waterfall: Fetch Products (IN_STOCK) and Categories in Parallel
  const [productsData, categories] = await Promise.all([
    getProducts({ search, category, stockStatus: 'IN_STOCK', first: BATCH_SIZE }),
    getCategories()
  ]);

  let products: Product[] = productsData.nodes;
  let pageInfo = productsData.pageInfo;
  let currentStockStatus = 'IN_STOCK';
  
  // 🔄 Automatic Transition: If IN_STOCK ends before the batch is full, 
  // fetch OUT_OF_STOCK items. (This is still sequential but only occurs if needed)
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
