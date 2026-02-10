"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
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
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % categories.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + categories.length) % categories.length);
  };

  return (
    <section className="w-full py-12 border-b border-black/5">
      <div className="flex items-center justify-between px-4 md:px-8 lg:px-12 mb-8">
        <h2 className="text-base font-bold tracking-widest uppercase border border-black px-3 py-1 inline-block">
          SHOP BY CATEGORY
        </h2>
        <div className="flex gap-2">
           <Button variant="outline" size="icon" onClick={prevSlide} className="rounded-none border-black hover:bg-black hover:text-white transition-colors">
              <ChevronLeft className="h-4 w-4" />
           </Button>
           <Button variant="outline" size="icon" onClick={nextSlide} className="rounded-none border-black hover:bg-black hover:text-white transition-colors">
              <ChevronRight className="h-4 w-4" />
           </Button>
        </div>
      </div>

      <div className="overflow-hidden w-full">
          <div 
            className="flex transition-transform duration-500 ease-in-out will-change-transform"
            style={{
                transform: `translateX(-${currentIndex * 100}%)`, // Mobile: slide by 100% per item
            }}
          >
             <style jsx>{`
                @media (min-width: 768px) {
                    .flex { transform: translateX(-${currentIndex * 25}%) !important; }
                }
             `}</style>
             
             {categories.map((category) => (
                 <div 
                    key={category.id} 
                    className="min-w-full md:min-w-[25%] px-0.5 border-r border-transparent md:border-black/5 last:border-none"
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
                                className="object-cover transition-transform duration-700"
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
