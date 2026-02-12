"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatPrice, cleanPrice, sortProductsByStock } from "@/lib/utils";
import { Product } from "@/types/woocommerce";
import { fetchMoreProducts } from "@/app/actions/shop";
import { Loader2 } from "lucide-react";

type PageInfo = {
    hasNextPage: boolean;
    endCursor: string | null;
};

type Props = {
    initialProducts: Product[];
    initialPageInfo: PageInfo;
    category?: string;
    search?: string;
    initialStockStatus?: string;
};

export function ProductGrid({ initialProducts, initialPageInfo, category, search, initialStockStatus }: Props) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [pageInfo, setPageInfo] = useState<PageInfo>(initialPageInfo);
    const [fetchingStatus, setFetchingStatus] = useState<string>(initialStockStatus || 'IN_STOCK');
    const [loading, setLoading] = useState(false);

    const loadMore = async () => {
        if (loading) return;

        setLoading(true);
        try {
            let currentCursor: string | null | undefined = pageInfo.endCursor;
            let currentStatus = fetchingStatus;
            let hasMore = pageInfo.hasNextPage;
            let allNewNodes: Product[] = [];
            const BATCH_SIZE = 12;

            // 1. If currently IN_STOCK and exhausted, switch to OUT_OF_STOCK immediately
            if (!hasMore && currentStatus === 'IN_STOCK') {
                currentStatus = 'OUT_OF_STOCK';
                currentCursor = undefined;
                setFetchingStatus('OUT_OF_STOCK');
                hasMore = true; // Force-enable to enter the fetch logic
            } else if (!hasMore) {
                // Truly no more products in any status
                setLoading(false);
                return;
            }

            // 2. Fetch the next batch
            const categoryFilter = category === "all-products" ? undefined : category;
            const result = await fetchMoreProducts({
                after: currentCursor || undefined,
                category: categoryFilter,
                search,
                stockStatus: currentStatus,
                first: BATCH_SIZE
            });

            allNewNodes = [...result.nodes];
            let updatedPageInfo = result.pageInfo;
            let updatedStatus = currentStatus;

            // 3. Chain Transition: If the fetch above depleted IN_STOCK, 
            // and we still have room in the batch (optional but good for consistency)
            // or if we just want to ensure we don't leave the user with an empty set.
            if (!updatedPageInfo.hasNextPage && updatedStatus === 'IN_STOCK') {
                const remainingToFill = BATCH_SIZE - allNewNodes.length;
                if (remainingToFill > 0) {
                    const oosResult = await fetchMoreProducts({
                        after: undefined,
                        category: categoryFilter,
                        search,
                        stockStatus: 'OUT_OF_STOCK',
                        first: remainingToFill
                    });
                    allNewNodes = [...allNewNodes, ...oosResult.nodes];
                    updatedPageInfo = oosResult.pageInfo;
                }
                setFetchingStatus('OUT_OF_STOCK');
                updatedStatus = 'OUT_OF_STOCK';
            }

            setProducts(prev => [...prev, ...allNewNodes]);
            setPageInfo(updatedPageInfo);
        } catch (error) {
            console.error("Failed to load more products", error);
        } finally {
            setLoading(false);
        }
    };

    if (products.length === 0) {
         return (
             <div className="col-span-full py-12 text-center text-muted-foreground">
                 No products found.
             </div>
         );
    }

    const hasMoreContent = pageInfo.hasNextPage || fetchingStatus === 'IN_STOCK';

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full border-t border-black/10">
                {products.map((product) => (
                    <Link 
                        href={`/shop/${product.slug}`} 
                        key={`${product.id}-${product.slug}`} 
                        className="group block bg-card overflow-hidden hover:border-black hover:border transition-all border-b border-r border-black/10 last:border-r-0 md:last:border-r"
                    >
                        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                            {product.image?.sourceUrl ? (
                                <Image
                                    src={product.image.sourceUrl}
                                    alt={product.image.altText || product.name}
                                    fill
                                    className="object-cover transition-transform duration-500"
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                    No Image
                                </div>
                            )}
                            {product.stockStatus === 'OUT_OF_STOCK' && (
                                <div className="absolute top-2 bg-black text-white text-xs px-2 py-1 font-medium">
                                    OUT OF STOCK
                                </div>
                            )}
                        </div>
                        <div className="p-4 md:p-6">
                            <h3 className="font-medium lg:text-[15px] tracking-wider text-[12px] uppercase md:text-sm mb-2 line-clamp-2">
                                {product.name}
                            </h3>
                            <p className="text-[12px] font-medium tracking-[0.1em]">
                                {product.price ? cleanPrice(product.price) : formatPrice(0)} 
                            </p>
                        </div>
                    </Link>
                ))}
            </div>

            {hasMoreContent && (
                <div className="flex justify-center pt-8">
                    <Button 
                        onClick={loadMore} 
                        disabled={loading}
                        size="lg"
                        className="min-w-[150px]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            "Load More"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
