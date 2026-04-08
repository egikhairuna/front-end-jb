"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORIES = [
  { name: "JACKETS", slug: "jackets" },
  { name: "SWEATS", slug: "sweats" },
  { name: "ACCESSORIES", slug: "seasoning" }, 
  { name: "POLO SHIRTS", slug: "polo-shirt" },
];

export function Categories() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
      setScrollProgress(progress);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth, scrollLeft } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="w-full bg-white border-t border-black/10 pb-0 md:pb-8">
      {/* Header — matching ProductCarousel */}
      <div className="flex items-center justify-between px-4 md:px-12 py-4 md:py-6 border-b border-black/10">
        <span className="text-[13px] font-medium tracking-[0.2em] uppercase text-[#1a1a1a]">
          SHOP BY CATEGORIES
        </span>
      </div>

      {/* Full Width Grid / Mobile Scroll */}
      <div className="relative group">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex md:grid md:grid-cols-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-2"
        >
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop/category/${cat.slug}`}
              className="flex-none w-[82vw] md:w-auto aspect-[4/5] md:aspect-[3/4] bg-black relative overflow-hidden snap-start group/item"
            >
              {/* Black Overlay/Background */}
              <div className="absolute inset-0 bg-black" />
              
              {/* Content Overlay */}
              <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center">
                <span className="text-white text-[13px] md:text-[14px] font-medium tracking-[0.2em] transition-transform duration-500 group-hover/item:scale-105 flex items-center gap-2">
                  {cat.name}
                  <span className="-mt-[6px] text-[28px]">&rsaquo;</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

        {/* Mobile Controls (Arrows + Progress Bar) */}
        <div className="mt-8 flex flex-col items-center md:hidden px-4">
          <div className="w-full flex items-center justify-between mb-6">
            <button
              onClick={() => scroll("left")}
              className="p-2 text-neutral-400 hover:text-black transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6 stroke-[1px]" />
            </button>
            
            {/* Progress Bar Container */}
            <div className="flex-1 mx-8 h-[2px] bg-neutral-200 relative">
              <div 
                className="absolute top-0 left-0 h-full bg-black transition-all duration-300 ease-out"
                style={{ width: "25%", left: `${(scrollProgress / 100) * 75}%` }}
              />
            </div>

            <button
              onClick={() => scroll("right")}
              className="p-2 text-neutral-400 hover:text-black transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6 stroke-[1px]" />
            </button>
          </div>
        </div>
    </section>
  );
}
