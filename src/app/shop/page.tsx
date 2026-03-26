import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { fetchGraphQL } from "@/lib/graphql/server-client";
import { GET_PRODUCTS, GET_CATEGORIES, GET_PRODUCT_COUNT } from "@/lib/graphql/queries";
import { Product } from "@/types/woocommerce";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const category = typeof params.category === 'string' ? params.category : undefined;
  
  let title = "Shop";
  let description = "Explore the latest collection, including outerwear, polo shirt, and other stuff in the statement of the season.";

  if (category) {
    // Basic mapping for common categories to avoid extra DB calls if possible,
    // though we could also fetch category name here if needed.
    const categoryNames: { [key: string]: string } = {
      'sweats': 'Sweatshirts',
      'jackets': 'Jackets',
      'seasoning': 'Accessories',
      'shorts-trousers': 'Shorts & Trousers',
      'polo-shirt': 'Polo Shirts',
      't-shirt': 'T-Shirts',
      'shirt': 'Shirts',
      'lofty': 'Lofty',
      'fancy': 'Fancy',
      'frolic': 'Frolic',
      'ventile': 'Ventile®'
    };

    if (categoryNames[category]) {
      title = `${categoryNames[category]} | James Boogie`;
      description = `Shop the latest ${categoryNames[category]} collection from James Boogie. High-quality pop military inspired clothing.`;
    }
  }

  return {
    title,
    description,
    alternates: {
      canonical: category ? `/shop?category=${category}` : "/shop",
    },
  };
}

// ⚡ Global ISR config: 5 mins cache for the whole page
export const revalidate = 300;

// Types
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Map URL sort param → WooCommerce orderby input
function buildOrderby(sort?: string) {
  switch (sort) {
    case 'price-asc':
      return [{ field: 'PRICE', order: 'ASC' }];
    case 'price-desc':
      return [{ field: 'PRICE', order: 'DESC' }];
    case 'new':
      return [{ field: 'DATE', order: 'DESC' }];
    default:
      return null; // WooCommerce default (menu order)
  }
}

async function getProducts({ 
  after, 
  category, 
  search, 
  stockStatus,
  sort,
  first = 12 
}: { 
  after?: string; 
  category?: string; 
  search?: string; 
  stockStatus?: string;
  sort?: string;
  first?: number;
}) {
   try {
     const categoryFilter = (category === "all-products" || !category) ? null : category;

     const data: any = await fetchGraphQL(GET_PRODUCTS, {
       first,
       after,
       category: categoryFilter,
       search: search || null,
       stockStatus: stockStatus ? [stockStatus] : null,
       orderby: buildOrderby(sort),
     }, {
       revalidate: 600,
       tags: ['products', stockStatus || 'all']
     });
     return data.products;
   } catch (error) {
     console.error("Error fetching products", error);
     return { nodes: [], pageInfo: { hasNextPage: false, endCursor: null }, found: 0 };
   }
}

async function getTotalInStockCount(category?: string, search?: string) {
  try {
    const categoryFilter = (category === "all-products" || !category) ? null : category;
    const data: any = await fetchGraphQL(GET_PRODUCT_COUNT, {
      category: categoryFilter,
      search: search || null,
      stockStatus: ['IN_STOCK'],
    }, {
      revalidate: 600,
      tags: ['products', 'count']
    });
    return data.products?.found ?? 0;
  } catch {
    return 0;
  }
}

async function getCategories() {
    try {
        const data: any = await fetchGraphQL(GET_CATEGORIES, {}, {
          revalidate: 3600,
          tags: ['categories']
        });
        return data.productCategories.nodes;
    } catch (error) {
        return [];
    }
}

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const search   = typeof params.search   === 'string' ? params.search   : undefined;
  const category = typeof params.category === 'string' ? params.category : undefined;
  const sort     = typeof params.sort     === 'string' ? params.sort     : undefined;
  const BATCH_SIZE = 12;

  // 🚀 Parallel fetch: products, categories, total count
  const [productsData, categories, totalCount] = await Promise.all([
    getProducts({ search, category, stockStatus: 'IN_STOCK', sort, first: BATCH_SIZE }),
    getCategories(),
    getTotalInStockCount(category, search),
  ]);

  let products: Product[] = productsData.nodes;
  let pageInfo = productsData.pageInfo;
  let currentStockStatus = 'IN_STOCK';
  
  // 🔄 If IN_STOCK exhausted before batch is full, top up with OUT_OF_STOCK
  if (!pageInfo.hasNextPage && products.length < BATCH_SIZE) {
    const remainingCount = BATCH_SIZE - products.length;
    const outOfStockData = await getProducts({ 
      search, 
      category, 
      stockStatus: 'OUT_OF_STOCK', 
      sort,
      first: remainingCount 
    });

    products = [...products, ...outOfStockData.nodes];
    pageInfo = outOfStockData.pageInfo;
    currentStockStatus = 'OUT_OF_STOCK';
  }
  
  // Find active category
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
      <div className="w-full pb-10">
        <div className="w-full pt-20">
          <div className="mb-8 px-6 md:px-8 lg:px-12">
            <Breadcrumbs items={breadcrumbItems} className="px-0 pt-4" />
            <h1 className="text-4xl font-medium tracking-wider font-heading uppercase">{displayTitle}</h1>
            {search && <p className="text-muted-foreground">Showing results for &quot;{search}&quot;</p>}
          </div>

          {/* Product Grid */}
          <div className="w-full">
            <ProductGrid 
              key={`${category || 'all'}-${search || 'none'}-${sort || 'default'}`}
              initialProducts={products} 
              initialPageInfo={pageInfo}
              category={category}
              search={search}
              sort={sort}
              initialStockStatus={currentStockStatus}
              categories={categories}
              totalCount={totalCount}
            />
          </div>
        </div>
      </div>
    </>
  );
}
