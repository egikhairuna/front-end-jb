"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cleanPrice } from "@/lib/utils";
import { useCurrency } from "@/lib/currency/context";
import { parsePriceString } from "@/lib/currency/config";
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

type GridSession = {
    version: string;
    loadMoreCount: number;
    scrollY: number;
    timestamp: number;
};

const SESSION_VERSION = "v1";
const SESSION_TTL = 10 * 60 * 1000; // 10 minutes

function buildSessionKey(pathname: string, searchParams: URLSearchParams): string {
    const params = new URLSearchParams(searchParams.toString());
    const qs = params.toString();
    return `shop_session_${pathname}${qs ? `?${qs}` : ""}`;
}

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
    const { formatPrice, formatProductPriceRange } = useCurrency();
    const [products, setProducts]         = useState<Product[]>(initialProducts);
    const [pageInfo, setPageInfo]         = useState<PageInfo>(initialPageInfo);
    const [fetchingStatus, setFetchStatus] = useState<string>(initialStockStatus || "IN_STOCK");
    const [loading, setLoading]           = useState(false);
    const [gridView, setGridView]         = useState<"wide" | "compact">("wide");
    const [drawerOpen, setDrawerOpen]     = useState(false);
    const [loadMoreCount, setLoadMoreCount] = useState(0);

    const drawerRef = useRef<HTMLDivElement>(null);

    const router      = useRouter();
    const pathname    = usePathname();
    const searchParams = useSearchParams();

    const sessionKey = useMemo(
        () => buildSessionKey(pathname, searchParams),
        [pathname, searchParams]
    );

    // ── Restore on mount: re-fetch all pages ──────────────────────────────
    useEffect(() => {
        // One-time: clear all old-format cache entries (pg_ prefix)
        try {
            Object.keys(sessionStorage)
                .filter(k => k.startsWith("pg_"))
                .forEach(k => sessionStorage.removeItem(k));
        } catch {}

        const restore = async () => {
            try {
                // Check if user is returning from a product page
                const returningFlag = sessionStorage.getItem(`${sessionKey}_returning`);
                if (!returningFlag) {
                    // Not a back-navigation — clear any stale session and scroll to top
                    sessionStorage.removeItem(sessionKey);
                    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
                    return;
                }

                // Clear the flag immediately (one-time use)
                sessionStorage.removeItem(`${sessionKey}_returning`);

                const raw = sessionStorage.getItem(sessionKey);
                if (!raw) return;

                const session: GridSession = JSON.parse(raw);

                // Validate
                if (session.version !== SESSION_VERSION) {
                    sessionStorage.removeItem(sessionKey);
                    return;
                }
                if (Date.now() - session.timestamp > SESSION_TTL) {
                    sessionStorage.removeItem(sessionKey);
                    return;
                }
                if (session.loadMoreCount <= 0) return;

                // Re-fetch all extra pages silently (no loading spinner shown)
                setLoading(true);

                let allProducts = [...initialProducts];
                let currentPageInfo = initialPageInfo;
                let currentStatus = initialStockStatus || "IN_STOCK";
                const catFilter = category === "all-products" ? undefined : category;
                const BATCH = 12;

                for (let i = 0; i < session.loadMoreCount; i++) {
                    let cursor = currentPageInfo.endCursor;
                    let status = currentStatus;
                    let hasMore = currentPageInfo.hasNextPage;

                    if (!hasMore && status === "IN_STOCK") {
                        status = "OUT_OF_STOCK";
                        cursor = null;
                        hasMore = true;
                    } else if (!hasMore) {
                        break;
                    }

                    const result = await fetchMoreProducts({
                        after: cursor ?? undefined,
                        category: catFilter,
                        search,
                        stockStatus: status,
                        first: BATCH,
                    });

                    let newNodes = [...result.nodes];
                    let updatedPI = result.pageInfo;

                    if (!updatedPI.hasNextPage && status === "IN_STOCK") {
                        const remaining = BATCH - newNodes.length;
                        if (remaining > 0) {
                            const oos = await fetchMoreProducts({
                                after: undefined,
                                category: catFilter,
                                search,
                                stockStatus: "OUT_OF_STOCK",
                                first: remaining,
                            });
                            newNodes = [...newNodes, ...oos.nodes];
                            updatedPI = oos.pageInfo;
                        }
                        status = "OUT_OF_STOCK";
                    }

                    allProducts = [...allProducts, ...newNodes];
                    currentPageInfo = updatedPI;
                    currentStatus = status;
                }

                setProducts(allProducts);
                setPageInfo(currentPageInfo);
                setFetchStatus(currentStatus);
                setLoadMoreCount(session.loadMoreCount);

                // Restore scroll after DOM updates
                setTimeout(() => {
                    window.scrollTo({ top: session.scrollY, behavior: "instant" as ScrollBehavior });
                }, 100);

            } catch (e) {
                console.error("Failed to restore shop session", e);
            } finally {
                setLoading(false);
            }
        };

        restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Save session state before navigating ──────────────────────────────
    const saveSession = useCallback(() => {
        try {
            const session: GridSession = {
                version: SESSION_VERSION,
                loadMoreCount,
                scrollY: window.scrollY,
                timestamp: Date.now(),
            };
            sessionStorage.setItem(sessionKey, JSON.stringify(session));
            sessionStorage.setItem(`${sessionKey}_returning`, "1");
        } catch {}
    }, [loadMoreCount, sessionKey]);

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
        try {
            sessionStorage.removeItem(sessionKey);
            sessionStorage.removeItem(`${sessionKey}_returning`);
        } catch {}
        const params = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(updates)) {
            if (value === null || value === "") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        }
        // Always ensure category is NOT in query params anymore
        params.delete("category");
        const qs = params.toString();
        router.push(`${pathname}${qs ? `?${qs}` : ""}`);
        setDrawerOpen(false);
    };

    const handleCategory = (slug: string | null) => {
        try {
            sessionStorage.removeItem(sessionKey);
            sessionStorage.removeItem(`${sessionKey}_returning`);
        } catch {}
        const params = new URLSearchParams(searchParams.toString());
        params.delete("category"); // Clean up old query param if it exists
        const qs = params.toString();
        
        if (!slug || slug === "all-products") {
            router.push(`/shop${qs ? `?${qs}` : ""}`);
        } else {
            router.push(`/shop/category/${slug}${qs ? `?${qs}` : ""}`);
        }
        setDrawerOpen(false);
    };

    const handleSort = (value: string) => navigate({ sort: value || null });

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
            setLoadMoreCount(prev => prev + 1);
        } catch (e) {
            console.error("Failed to load more products", e);
        } finally {
            setLoading(false);
        }
    };

    // ── Derived ────────────────────────────────────────────────────────────────

    const hasMoreContent = pageInfo.hasNextPage || fetchingStatus === "IN_STOCK";

    const gridClass = gridView === "wide"
        ? "grid grid-cols-2 md:grid-cols-4 w-full gap-0 border-t border-black/10"
        : "grid grid-cols-1 md:grid-cols-6 w-full gap-0 border-t border-black/10";

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
                    fixed top-0 right-0 h-full w-full
                    sm:w-[320px]
                    bg-white z-[110]
                    flex flex-col shadow-2xl
                    transition-transform duration-300 ease-in-out
                    ${drawerOpen ? "translate-x-0" : "translate-x-full"}
                `}
            >
                {/* Drawer header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
                    <span className="text-[12px] tracking-widest uppercase font-medium">Filter &amp; Sort</span>
                    <button
                        onClick={() => setDrawerOpen(false)}
                        className="text-[12px] tracking-widest uppercase font-medium text-black/60 hover:text-black transition-colors flex items-center gap-1.5"
                    >
                        Close
                        <X size={14} strokeWidth={2} />
                    </button>
                </div>

                {/* Drawer body — scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

                    {/* ─ Sort By ───────────────────────────────────────────── */}
                    <div>
                        <p className="text-[12px] tracking-widest uppercase font-medium mb-4">
                            Sort By
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {SORT_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleSort(opt.value)}
                                    className={`
                                        text-[12px] tracking-widest uppercase px-3 py-2 border transition-colors
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
                    <div className="h-px bg-black" />

                    {/* ─ Category ──────────────────────────────────────────── */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[12px] tracking-widest uppercase font-medium">
                                Category
                            </p>
                            <span className="text-black/30 text-lg font-light select-none">—</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {/* All */}
                            <button
                                onClick={() => handleCategory(null)}
                                className={`
                                    text-[12px] tracking-widest uppercase px-3 py-2 border transition-colors
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
                <div className="flex items-center justify-between px-6 md:px-8 lg:px-12 py-3 border-t border-b border-black/30">

                    {/* Left: real total count */}
                    <span className="hidden md:block text-[12px] tracking-widest uppercase text-black font-medium">
                        {totalCount} Product{totalCount !== 1 ? "s" : ""}
                    </span>

                    {/* Right: filter button + grid toggle */}
                    <div className="flex-1 flex items-center justify-between md:flex-none md:justify-end md:gap-4">
                        {/* Filters button */}
                        <button
                            onClick={() => setDrawerOpen(true)}
                            aria-label="Open filter drawer"
                            className="text-[12px] tracking-widest uppercase font-medium text-black hover:text-black transition-colors flex items-center gap-1.5"
                        >
                            Filters
                        </button>

                        <div className="flex items-center gap-4">
                            {/* Divider */}
                            <span className="w-px h-4 bg-black/20" aria-hidden />

                            {/* Compact grid (1-col mobile / 6-col desktop) */}
                            <button
                                onClick={() => setGridView("compact")}
                                aria-label="6 Column Grid"
                                className={`transition-opacity ${gridView === "compact" ? "opacity-100" : "opacity-30 hover:opacity-60"}`}
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

                            {/* Wide grid (2-col mobile / 4-col desktop) */}
                            <button
                                onClick={() => setGridView("wide")}
                                aria-label="4 Column Grid"
                                className={`transition-opacity ${gridView === "wide" ? "opacity-100" : "opacity-30 hover:opacity-60"}`}
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="1"  y="1"  width="7.5" height="7.5" rx="0.5" fill="currentColor"/>
                                    <rect x="9.5" y="1"  width="7.5" height="7.5" rx="0.5" fill="currentColor"/>
                                    <rect x="1"  y="9.5" width="7.5" height="7.5" rx="0.5" fill="currentColor"/>
                                    <rect x="9.5" y="9.5" width="7.5" height="7.5" rx="0.5" fill="currentColor"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Product Grid ────────────────────────────────────────── */}
                <div className={gridClass}>
                    {products.map((product) => (
                        <Link
                            href={`/product/${product.slug}`}
                            key={`${product.id}-${product.slug}`}
                            onClick={saveSession}
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
                                    {formatProductPriceRange(product.price)}
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
