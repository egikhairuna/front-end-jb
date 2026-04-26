"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";

const mobileImages = [
  "https://vps.jamesboogie.com/wp-content/uploads/2026/04/h1-scaled.jpeg",
  "https://vps.jamesboogie.com/wp-content/uploads/2026/04/h2-scaled.jpeg",
  "https://vps.jamesboogie.com/wp-content/uploads/2026/04/h3-scaled.jpeg",
  "https://vps.jamesboogie.com/wp-content/uploads/2026/04/h4-scaled.jpeg",
  "https://vps.jamesboogie.com/wp-content/uploads/2026/04/h5-scaled.jpeg",
  "https://vps.jamesboogie.com/wp-content/uploads/2026/04/h6-scaled.jpeg",
  "https://vps.jamesboogie.com/wp-content/uploads/2026/04/h7-scaled.jpeg",
];

const desktopImages = [
  "https://vps.jamesboogie.com/wp-content/uploads/2026/04/desktop1-scaled.jpeg",
  "https://vps.jamesboogie.com/wp-content/uploads/2026/04/desktop2-scaled.jpeg",
];

function useSlider(images: string[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(goNext, 5000);
  }, [goNext]);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoPlay]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext(); else goPrev();
      startAutoPlay();
    }
  };

  return { currentIndex, goTo, startAutoPlay, handleTouchStart, handleTouchEnd };
}

export function Hero() {
  const mobile = useSlider(mobileImages);
  const desktop = useSlider(desktopImages);

  const sliderStyles = (images: string[], index: number) => ({
    width: `${images.length * 100}vw`,
    transform: `translateX(calc(-${index} * 100vw))`,
    transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    willChange: "transform" as const,
  });

  const imgStyle: React.CSSProperties = {
    width: "100vw",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center top",
    display: "block",
    flexShrink: 0,
    margin: 0,
    padding: 0,
  };

  return (
    <section className="relative h-[80vh] md:h-screen w-full bg-neutral-900 text-white flex items-end justify-center overflow-hidden p-8 pb-32 md:pb-24">
      {/* Background */}
      <div className="absolute inset-0 z-0">

        {/* ── Desktop Slider ── */}
        <div
          className="hidden md:block absolute inset-0 overflow-hidden"
          onTouchStart={desktop.handleTouchStart}
          onTouchEnd={desktop.handleTouchEnd}
        >
          <div className="flex h-full" style={sliderStyles(desktopImages, desktop.currentIndex)}>
            {desktopImages.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt={`Desktop Hero ${i + 1}`} style={imgStyle} />
            ))}
          </div>
        </div>

        {/* ── Mobile Slider ── */}
        <div
          className="md:hidden absolute inset-0 overflow-hidden"
          onTouchStart={mobile.handleTouchStart}
          onTouchEnd={mobile.handleTouchEnd}
        >
          <div className="flex h-full" style={sliderStyles(mobileImages, mobile.currentIndex)}>
            {mobileImages.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt={`Mobile Hero ${i + 1}`} style={imgStyle} />
            ))}
          </div>
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-black/15 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* ── Desktop Dots ── */}
      <div className="hidden md:flex absolute bottom-[6rem] left-0 right-0 justify-center gap-1.5 z-10">
        {desktopImages.map((_, i) => (
          <button
            key={i}
            onClick={() => { desktop.goTo(i); desktop.startAutoPlay(); }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === desktop.currentIndex ? "bg-white w-4" : "bg-white/40 w-1.5"
            }`}
          />
        ))}
      </div>

      {/* ── Mobile Dots ── */}
      <div className="md:hidden absolute bottom-[7rem] left-0 right-0 flex justify-center gap-1.5 z-10">
        {mobileImages.map((_, i) => (
          <button
            key={i}
            onClick={() => { mobile.goTo(i); mobile.startAutoPlay(); }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === mobile.currentIndex ? "bg-white w-4" : "bg-white/40 w-1.5"
            }`}
          />
        ))}
      </div>

      {/* Hero Text */}
      <header className="relative z-10 max-w-4xl flex flex-col items-center text-center space-y-1">
        <h1 className="text-3xl md:text-5xl font-medium font-heading tracking-wider leading-tight uppercase">
          PRISTINE '026
        </h1>
        <p className="text-[10px] md:text-xs text-neutral-300 tracking-[0.4em] uppercase font-medium">
          Untouched, Unspoiled, and Unblemished
        </p>
        <div className="flex items-center justify-center">
          <Link
            href="/shop/category/pristine"
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
