"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
  href: string;
  image: string;
  comingSoon?: boolean;
}

const categories: Category[] = [
  {
    id: 1,
    name: "JACKETS",
    href: "/shop?category=jackets",
    image: "/categories/jacket-cover.png",
  },
  {
    id: 2,
    name: "SWEATSHIRTS",
    href: "#",
    image: "/categories/ss-cover.png",
    comingSoon: true,
  },
  {
    id: 3,
    name: "POLO SHIRTS",
    href: "/shop?category=polo-shirt",
    image: "/categories/polo-cover.png",
  },
  {
    id: 4,
    name: "ACCESSORIES",
    href: "/shop?category=seasoning",
    image: "/categories/acc-cover.png",
  },
];

export function ProductCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <section className="w-full overflow-hidden">
      {/* Header — label + arrows (arrows hidden on desktop) */}
      <div className="flex items-center justify-between px-4 md:px-12 py-6 border-b border-black/10">
        <span className="text-sm font-semibold tracking-wider uppercase">
          SHOP BY CATEGORIES
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

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-16"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            className="relative flex-none w-[85vw] md:w-1/4 aspect-[3/4] md:aspect-auto md:h-[30vh] lg:h-[80vh] snap-start group overflow-hidden block"
            style={{ scrollSnapAlign: "start" }}
          >
            {/* Background image */}
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              draggable={false}
              priority={category.id <= 2}
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/90 pointer-events-none" />

            {/* Category label — center left */}
            <div className="absolute inset-y-0 left-6 flex items-center z-10">
              <span
                className="text-white text-[11px] md:text-sm font-semibold tracking-[0.25em] uppercase"
                style={{ fontFamily: "monospace, sans-serif", letterSpacing: "0.22em" }}
              >
                + {category.name}
              </span>
            </div>

            {/* CTA — bottom left */}
            <div className="absolute bottom-8 left-6 z-10">
              <span
                className="text-white text-[11px] md:text-[12px] font-semibold tracking-[0.2em] uppercase border-b border-white/70 pb-px group-hover:border-white transition-colors"
                style={{ fontFamily: "monospace, sans-serif" }}
              >
                {category.comingSoon ? "COMING SOON" : "SHOP NOW"}
              </span>
            </div>

            {/* Thin right divider (except last) */}
            <div className="absolute top-0 right-0 h-full w-px bg-white/10 pointer-events-none last:hidden" />
          </Link>
        ))}
      </div>


    </section>
  );
}
