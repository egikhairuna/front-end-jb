"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative h-[100vh] w-full bg-neutral-900 text-white flex items-end justify-center overflow-hidden p-8 pb-32 md:pb-24">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        {/* Desktop Landscape Video */}
        <video 
          src="/videos/desktop_hero.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline
          preload="metadata"
          className="hidden md:block w-full h-full object-cover lg:scale-112 md:scale-132"
        />
        {/* Mobile Portrait Image */}
        <video
          src="https://vps.jamesboogie.com/wp-content/uploads/2026/03/Cowax-Mobile.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="block md:hidden w-full h-full object-cover"
        />
        {/* Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-black/15 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <header className="relative z-10 max-w-4xl flex flex-col items-center text-center space-y-1">
        <h1 className="text-3xl md:text-5xl font-medium font-heading tracking-wider leading-tight uppercase">
          LOFTY '026
        </h1>
        <p className="text-[10px] md:text-xs text-neutral-300 tracking-[0.4em] uppercase font-medium">
          An exploration of form, colours, and craft
        </p>
        <div className="flex items-center justify-center">
          <Link 
            href="/shop/category/lofty" 
            className="group flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase hover:opacity-70 transition-opacity"
          >
            Discover More
            <span className="text-[10px] md:text-lg mb-[0.2em] font-regular transition-transform group-hover:translate-x-1">
              &gt;
            </span>
          </Link>
        </div>
      </header>
    </section>
  );
}
