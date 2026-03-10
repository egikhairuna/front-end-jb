"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatPrice, cleanPrice } from "@/lib/utils";
import { Product } from "@/types/woocommerce";
import { fetchMoreProducts } from "@/app/actions/shop";
import { Loader2, X, SlidersHorizontal } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type PageInfo = {
    hasNextPage: boolean;
    endCursor: string | null;
};

type Category = {
    id: string;
    name: string;
    slug: string;
    count: number;
};

type Props = {
    initialProducts: Product[];
    initialPageInfo: PageInfo;
    category?: string;
    search?: string;
    sort?: string;
    initialStockStatus?: string;
    categories?: Category[];
    totalCount?: number;
};

// ─── Sort options ──────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
    { label: "Selected",          value: "" },
    { label: "Price Low to High", value: "price-asc" },
    { label: "Price High to Low", value: "price-desc" },
    { label: "New In",            value: "new" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductGrid({
    initialProducts,
    initialPageInfo,
    category,
    search,
    sort,
    initialStockStatus,
    categories = [],
    totalCount = 0,
}: Props) {
    const [products, setProducts]         = useState<Product[]>(initialProducts);
    const [pageInfo, setPageInfo]         = useState<PageInfo>(initialPageInfo);
    const [fetchingStatus, setFetchStatus] = useState<string>(initialStockStatus || "IN_STOCK");
    const [loading, setLoading]           = useState(false);
    const [gridView, setGridView]         = useState<"wide" | "compact">("wide");
    const [drawerOpen, setDrawerOpen]     = useState(false);

    const drawerRef = useRef<HTMLDivElement>(null);

    const router      = useRouter();
    const pathname    = usePathname();
    const searchParams = useSearchParams();

    // Close drawer on outside click
    useEffect(() => {
        if (!drawerOpen) return;
        const onOutside = (e: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
                setDrawerOpen(false);
            }
        };
        document.addEventListener("mousedown", onOutside);
        return () => document.removeEventListener("mousedown", onOutside);
    }, [drawerOpen]);

    // Lock body scroll when drawer is open
    useEffect(() => {
        document.body.style.overflow = drawerOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [drawerOpen]);

    // ── Navigation helpers ──────────────────────────────────────────────────

    const navigate = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(updates)) {
            if (value === null || value === "") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        }
        const qs = params.toString();
        router.push(`${pathname}${qs ? `?${qs}` : ""}`);
        setDrawerOpen(false);
    };

    const handleCategory = (slug: string | null) => navigate({ category: slug ?? null });
    const handleSort     = (value: string)       => navigate({ sort: value || null });

    // ── Load more ─────────────────────────────────────────────────────────────

    const loadMore = async () => {
        if (loading) return;
        setLoading(true);
        try {
            let cursor   = pageInfo.endCursor;
            let status   = fetchingStatus;
            let hasMore  = pageInfo.hasNextPage;
            let newNodes: Product[] = [];
            const BATCH = 12;

            if (!hasMore && status === "IN_STOCK") {
                status  = "OUT_OF_STOCK";
                cursor  = null;
                setFetchStatus("OUT_OF_STOCK");
                hasMore = true;
            } else if (!hasMore) {
                return;
            }

            const catFilter = category === "all-products" ? undefined : category;
            const result    = await fetchMoreProducts({
                after: cursor ?? undefined,
                category: catFilter,
                search,
                stockStatus: status,
                first: BATCH,
            });

            newNodes = [...result.nodes];
            let updatedPI  = result.pageInfo;

            if (!updatedPI.hasNextPage && status === "IN_STOCK") {
                const remaining = BATCH - newNodes.length;
                if (remaining > 0) {
                    const oos = await fetchMoreProducts({
                        after: undefined, category: catFilter, search,
                        stockStatus: "OUT_OF_STOCK", first: remaining,
                    });
                    newNodes   = [...newNodes, ...oos.nodes];
                    updatedPI  = oos.pageInfo;
                }
                setFetchStatus("OUT_OF_STOCK");
            }

            setProducts(prev => [...prev, ...newNodes]);
            setPageInfo(updatedPI);
        } catch (e) {
            console.error("Failed to load more products", e);
        } finally {
            setLoading(false);
        }
    };

    // ── Derived ────────────────────────────────────────────────────────────────

    const hasMoreContent = pageInfo.hasNextPage || fetchingStatus === "IN_STOCK";

    const gridClass = gridView === "wide"
        ? "grid grid-cols-2 lg:grid-cols-4 w-full gap-0 border-t border-black/10"
        : "grid grid-cols-1 lg:grid-cols-2 w-full gap-0 border-t border-black/10";

    const activeSort = sort ?? "";

    // ── Empty state ────────────────────────────────────────────────────────────

    if (products.length === 0) {
        return (
            <div className="col-span-full py-12 text-center text-muted-foreground">
                No products found.
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <>
            {/* ── Backdrop ──────────────────────────────────────────────────── */}
            {drawerOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-[105] transition-opacity"
                    aria-hidden
                />
            )}

            {/* ── Filter Drawer ─────────────────────────────────────────────── */}
            <div
                ref={drawerRef}
                className={`
                    fixed top-20 right-0 h-[calc(100%-80px)] w-full
                    sm:top-0 sm:h-full sm:w-[320px]
                    bg-white z-[110]
                    flex flex-col shadow-2xl
                    transition-transform duration-300 ease-in-out
                    ${drawerOpen ? "translate-x-0" : "translate-x-full"}
                `}
            >
                {/* Drawer header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
                    <span className="text-[11px] tracking-widest uppercase font-semibold">Filter &amp; Sort</span>
                    <button
                        onClick={() => setDrawerOpen(false)}
                        className="text-[10px] tracking-widest uppercase font-medium text-black/60 hover:text-black transition-colors flex items-center gap-1.5"
                    >
                        Close
                        <X size={12} strokeWidth={2} />
                    </button>
                </div>

                {/* Drawer body — scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

                    {/* ─ Sort By ───────────────────────────────────────────── */}
                    <div>
                        <p className="text-[11px] tracking-widest uppercase font-semibold mb-4">
                            Sort By
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {SORT_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleSort(opt.value)}
                                    className={`
                                        text-[11px] tracking-widest uppercase px-3 py-2 border transition-colors
                                        ${activeSort === opt.value
                                            ? "bg-black text-white border-black"
                                            : "bg-white text-black border-black hover:border-black hover:text-black"}
                                    `}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ─ Divider ──────────────────────────────────────────── */}
                    <div className="h-px bg-black/10" />

                    {/* ─ Category ──────────────────────────────────────────── */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[11px] tracking-widest uppercase font-semibold">
                                Category
                            </p>
                            <span className="text-black/30 text-lg font-light select-none">—</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {/* All */}
                            <button
                                onClick={() => handleCategory(null)}
                                className={`
                                    text-[11px] tracking-widest uppercase px-3 py-2 border transition-colors
                                    ${(!category || category === "all-products")
                                        ? "bg-black text-white border-black"
                                        : "bg-white text-black border-black hover:border-black hover:text-black"}
                                `}
                            >
                                All
                            </button>

                            {categories
                                .filter((c) => c.count > 0)
                                .map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategory(cat.slug)}
                                        className={`
                                            text-[11px] tracking-widest uppercase px-3 py-2 border transition-colors
                                            ${category === cat.slug
                                                ? "bg-black text-white border-black"
                                                : "bg-white text-black border-black hover:border-black hover:text-black"}
                                        `}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main content ──────────────────────────────────────────────── */}
            <div className="space-y-0">

                {/* ── Toolbar ─────────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-6 md:px-8 lg:px-12 py-3 border-t border-b border-black">

                    {/* Left: real total count */}
                    <span className="text-[12px] tracking-widest uppercase text-black font-medium">
                        {totalCount} Product{totalCount !== 1 ? "s" : ""}
                    </span>

                    {/* Right: filter button + grid toggle */}
                    <div className="flex items-center gap-4">

                        {/* Filters button */}
                        <button
                            onClick={() => setDrawerOpen(true)}
                            aria-label="Open filter drawer"
                            className="text-[12px] tracking-widest uppercase font-medium text-black hover:text-black transition-colors flex items-center gap-1.5"
                        >
                            Filters
                            {/* three-line funnel icon */}
                            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                            </svg>
                        </button>

                        {/* Divider */}
                        <span className="w-px h-4 bg-black/20" aria-hidden />

                        {/* Compact grid (1-col mobile / 2-col desktop) */}
                        <button
                            onClick={() => setGridView("compact")}
                            aria-label="Compact grid"
                            className={`transition-opacity ${gridView === "compact" ? "opacity-100" : "opacity-30 hover:opacity-60"}`}
                        >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="1"    y="1" width="6.5" height="16" rx="0.5" fill="currentColor"/>
                                <rect x="10.5" y="1" width="6.5" height="16" rx="0.5" fill="currentColor"/>
                            </svg>
                        </button>

                        {/* Wide grid (2-col mobile / 4-col desktop) */}
                        <button
                            onClick={() => setGridView("wide")}
                            aria-label="Wide grid"
                            className={`transition-opacity ${gridView === "wide" ? "opacity-100" : "opacity-30 hover:opacity-60"}`}
                        >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="1"    y="1"   width="3.5" height="7.5" rx="0.5" fill="currentColor"/>
                                <rect x="7.25" y="1"   width="3.5" height="7.5" rx="0.5" fill="currentColor"/>
                                <rect x="13.5" y="1"   width="3.5" height="7.5" rx="0.5" fill="currentColor"/>
                                <rect x="1"    y="9.5" width="3.5" height="7.5" rx="0.5" fill="currentColor"/>
                                <rect x="7.25" y="9.5" width="3.5" height="7.5" rx="0.5" fill="currentColor"/>
                                <rect x="13.5" y="9.5" width="3.5" height="7.5" rx="0.5" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* ── Product Grid ────────────────────────────────────────── */}
                <div className={gridClass}>
                    {products.map((product) => (
                        <Link
                            href={`/shop/${product.slug}`}
                            key={`${product.id}-${product.slug}`}
                            className="group block bg-card overflow-hidden hover:border-black hover:border transition-all"
                        >
                            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
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
                                {product.stockStatus === "OUT_OF_STOCK" && (
                                    <div className="absolute top-2 bg-black text-white text-xs px-2 py-1 font-medium">
                                        OUT OF STOCK
                                    </div>
                                )}
                            </div>
                            <div className="px-3 py-2 md:px-6 md:py-3">
                                <h3 className="font-regular lg:text-[15px] tracking-wider text-[11px] uppercase md:text-sm mb-1 md:mb-0 line-clamp-2">
                                    {product.name}
                                </h3>
                                <p className="text-[12px] lg:text-[15px] font-regular tracking-[0.1em]">
                                    {product.price ? cleanPrice(product.price) : formatPrice(0)}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* ── Load More ───────────────────────────────────────────── */}
                {hasMoreContent && (
                    <div className="flex justify-center pt-8 pb-4">
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
                                "LOAD MORE"
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}
