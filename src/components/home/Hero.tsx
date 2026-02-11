"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative h-[100vh] w-full bg-neutral-900 text-white flex items-end justify-start overflow-hidden p-8 pb-35 md:p-20 ">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/hero/1-1.jpeg" 
          alt="Lofty '026 Collection" 
          fill 
          priority
          className="object-cover"
        />
        {/* Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-black/15 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <header className="relative z-10 max-w-2xl space-y-6">
        <h1 className="text-5xl md:text-5xl font-bold font-heading tracking-tight leading-[0.9]">
          LOFTY '026
        </h1>
        <p className="text-lg md:text-sm text-neutral-200 max-w-md tracking-wider">
          An exploration of form, colours, and craft
        </p>
        <div className="flex items-center justify-start gap-4 ">
          <Button size="lg" className="text-base px-10 h-14 backdrop-blur-sm uppercase text-white border border-white hover:bg-white hover:text-black" asChild>
            <Link href="/shop">Discover More</Link>
          </Button>
        </div>
      </header>
    </section>
  );
}
