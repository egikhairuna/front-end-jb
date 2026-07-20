"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { cn, cleanPrice } from "@/lib/utils";
import { useCurrency } from "@/lib/currency/context";
import { Product } from "@/types/woocommerce";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  products: Product[];
}

export function ProductCarousel({ products }: Props) {
  const { formatProductPriceRange } = useCurrency();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const amount = clientWidth * 0.5;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - amount : scrollLeft + amount,
        behavior: "smooth",
      });
    }
  };

  // ── Drag Scroll Handlers ──────────────────────────────────────────────────
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="w-full overflow-hidden bg-white select-none">
      {/* Header — label + arrows (arrows hidden on desktop) */}
      <div className="flex items-center justify-between px-4 md:px-12 py-6 border-b border-black/10">
        <span className="text-[13px] font-medium tracking-[0.2em] uppercase text-[#1a1a1a]">
          FEATURED PRODUCTS
        </span>
        {/* Arrows — mobile only */}
        <div className="flex gap-2 md:hidden">
          <button
            aria-label="Previous"
            onClick={() => scroll("left")}
            className="w-8 h-8 flex items-center justify-center border border-black/20 hover:border-black hover:bg-black hover:text-white transition-all text-xs font-bold"
          >
            ←
          </button>
          <button
            aria-label="Next"
            onClick={() => scroll("right")}
            className="w-8 h-8 flex items-center justify-center border border-black/20 hover:border-black hover:bg-black hover:text-white transition-all text-xs font-bold"
          >
            →
          </button>
        </div>
      </div>

      <div className="relative group/carousel">
        {/* Desktop Navigation Arrows — Styled as requested: White squares on edges, always visible on md+ */}
        <button
          onClick={() => scroll("left")}
          className="hidden md:flex absolute left-0 top-[40%] -translate-y-1/2 z-30 w-12 h-12 items-center justify-center bg-white border border-black/10 shadow-sm hover:bg-neutral-50 transition-all disabled:opacity-0"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5 stroke-[1.5px]" />
        </button>
        
        <button
          onClick={() => scroll("right")}
          className="hidden md:flex absolute right-0 top-[40%] -translate-y-1/2 z-30 w-12 h-12 items-center justify-center bg-white border border-black/10 shadow-sm hover:bg-neutral-50 transition-all disabled:opacity-0"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5 stroke-[1.5px]" />
        </button>

        {/* Scroll container */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={cn(
            "flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 md:pb-16 px-4 md:px-0",
            isDragging ? "snap-none cursor-grabbing" : "cursor-grab"
          )}
          style={{ scrollSnapType: isDragging ? "none" : "x mandatory" }}
        >
          {products.map((product) => {
            const modelImage = product.galleryImages?.nodes?.[0] || product.image;
            
            return (
              <div
                key={product.id}
                className="flex-none w-[50vw] md:w-1/4 snap-start border-r border-black/5"
                style={{ scrollSnapAlign: "start" }}
              >
                <Link
                  href={`/product/${product.slug}`}
                  className="group block"
                  onClick={(e) => {
                    // Prevent navigation if we were dragging
                    if (isDragging) e.preventDefault();
                  }}
                >
                  {/* Image box */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#f0f0f0]">
                    {modelImage?.sourceUrl ? (
                      <Image
                        src={modelImage.sourceUrl}
                        alt={modelImage.altText || product.name}
                        fill
                        className="object-cover transition-transform duration-700 md:group-hover:scale-[1.02]"
                        draggable={false}
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400 uppercase text-[10px] tracking-widest">
                        No Image
                      </div>
                    )}
                    
                    {product.stockStatus === "OUT_OF_STOCK" && (
                      <div className="absolute top-4 left-4 bg-black text-white text-[10px] px-2 py-1 font-bold tracking-widest">
                        OUT OF STOCK
                      </div>
                    )}
                  </div>

                  {/* Product Price and Title */}
                  <div className="px-3 py-4 md:px-6">
                    <p 
                      className="font-regular lg:text-[15px] tracking-wider text-[11px] leading-tight uppercase md:text-sm mb-1 line-clamp-2 text-black"
                    >
                      {product.name}
                    </p>
                    <p 
                      className="text-[11px] lg:text-[15px] font-regular tracking-[0.1em] text-black/70"
                    >
                      {formatProductPriceRange(product.price)}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
