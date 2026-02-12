"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Category interface
interface Category {
  id: number;
  name: string;
  href: string;
  image: string;
  tag?: string;
}

export function ProductCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Category data with images and links
  const categories: Category[] = [
    { 
      id: 1, 
      name: "JACKETS", 
      href: "/shop?category=jackets",
      image: "/categories/jacket-cover.png",
      tag: "NEW IN", 
    },
    { 
      id: 2, 
      name: "JUMPERS", 
      href: "#",
      image: "/categories/ss-cover.png", 
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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = window.innerWidth < 768 ? clientWidth : clientWidth / 4;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="w-full py-12 border-b border-black/5 overflow-hidden">
      <div className="flex items-center justify-between px-4 md:px-8 lg:px-12 mb-8">
        <h2 className="text-base font-bold tracking-widest uppercase border border-black px-3 py-1 inline-block">
          SHOP BY CATEGORY
        </h2>
        <div className="flex gap-2">
           <Button variant="outline" size="icon" onClick={() => scroll('left')} className="rounded-none border-black hover:bg-black hover:text-white transition-colors">
              <ChevronLeft className="h-4 w-4" />
           </Button>
           <Button variant="outline" size="icon" onClick={() => scroll('right')} className="rounded-none border-black hover:bg-black hover:text-white transition-colors">
              <ChevronRight className="h-4 w-4" />
           </Button>
        </div>
      </div>

      <div className="w-full">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto md:overflow-x-hidden snap-x snap-mandatory scrollbar-hide will-change-transform"
          >
             {categories.map((category) => (
                 <div 
                    key={category.id} 
                    className="min-w-full md:min-w-[25%] snap-center border-r border-transparent md:border-black/5 last:border-none select-none"
                 >
                    <Link href={category.href} className="block group">
                        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                            {/* Tag */}
                            {category.tag && (
                                 <span className="absolute top-4 right-4 z-10 text-[10px] font-bold tracking-widest text-white mix-blend-difference uppercase">
                                    {category.tag}
                                 </span>
                            )}
                            
                            {/* Category Image */}
                            <Image 
                                src={category.image}
                                alt={category.name}
                                fill
                                className="object-cover transition-transform duration-700 font-bold"
                                draggable={false}
                            />
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        
                        <div className="pt-4 px-4 md:px-5 md:pt-6">
                            <h3 className="text-lg font-bold tracking-wider uppercase text-black">
                                {category.name}
                            </h3>
                            <button className="mt-2 text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:opacity-50 transition-opacity">
                                Shop Now
                            </button>
                        </div>
                    </Link>
                 </div>
             ))}
          </div>
      </div>
    </section>
  );
}
