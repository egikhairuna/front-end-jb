import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { fetchGraphQL } from "@/lib/graphql/server-client";
import { GET_PRODUCTS, GET_CATEGORIES, GET_PRODUCT_COUNT } from "@/lib/graphql/queries";
import { Product } from "@/types/woocommerce";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { notFound } from "next/navigation";

// Types
type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  
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

  const title = categoryNames[category] 
    ? `${categoryNames[category]} | James Boogie` 
    : `${category.charAt(0).toUpperCase() + category.slice(1)} | James Boogie`;
    
  const description = `Shop the latest ${categoryNames[category] || category} collection from James Boogie. High-quality pop military inspired clothing.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/shop/category/${category}`,
    },
  };
}

// ⚡ Global ISR config: 5 mins cache
export const revalidate = 300;

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
      return null;
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
     const data: any = await fetchGraphQL(GET_PRODUCTS, {
       first,
       after,
       category,
       search: search || null,
       stockStatus: stockStatus ? [stockStatus] : null,
       orderby: buildOrderby(sort),
     }, {
       revalidate: 600,
       tags: ['products', category || 'all']
     });
     return data.products;
   } catch (error) {
     console.error("Error fetching products", error);
     return { nodes: [], pageInfo: { hasNextPage: false, endCursor: null }, found: 0 };
   }
}

async function getTotalInStockCount(category?: string, search?: string) {
  try {
    const data: any = await fetchGraphQL(GET_PRODUCT_COUNT, {
      category,
      search: search || null,
      stockStatus: ['IN_STOCK'],
    }, {
      revalidate: 600,
      tags: ['products', 'count', category || 'all']
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

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const sParams = await searchParams;
  
  const search = typeof sParams.search === 'string' ? sParams.search : undefined;
  const sort   = typeof sParams.sort   === 'string' ? sParams.sort   : undefined;
  const BATCH_SIZE = 12;

  // 🚀 Parallel fetch
  const [productsData, categories, totalCount] = await Promise.all([
    getProducts({ search, category, stockStatus: 'IN_STOCK', sort, first: BATCH_SIZE }),
    getCategories(),
    getTotalInStockCount(category, search),
  ]);

  // If category doesn't exist in our list, it might be a 404
  const activeCategory = categories.find((c: any) => c.slug === category);
  if (!activeCategory && category !== "all-products") {
     // Optional: check if it's a valid category slug from DB if not in the map
     // For now, let's trust the GraphQL results. If no products and no category found, maybe 404
     if (productsData.nodes.length === 0 && !activeCategory) {
        // notFound(); 
     }
  }

  let products: Product[] = productsData.nodes;
  let pageInfo = productsData.pageInfo;
  let currentStockStatus = 'IN_STOCK';
  
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
  
  const displayTitle = activeCategory ? activeCategory.name : (category.charAt(0).toUpperCase() + category.slice(1));

  // Breadcrumbs
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop", active: false },
    { label: displayTitle, href: `/shop/category/${category}`, active: true },
  ];

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

          <div className="w-full">
            <ProductGrid 
              key={`${category}-${search || 'none'}-${sort || 'default'}`}
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
