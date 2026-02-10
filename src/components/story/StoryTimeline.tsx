"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { STORY_DATA, StoryYear } from '@/constants/story-data';
import { cn } from '@/lib/utils';
import { motion, useScroll, useSpring } from 'framer-motion';

export const StoryTimeline: React.FC = () => {
  const [activeYear, setActiveYear] = useState(STORY_DATA[0].year);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    STORY_DATA.forEach((item) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveYear(item.year);
            // Scroll tabs into view on mobile
            const tab = tabRefs.current[item.year];
            if (tab) {
              tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
          }
        },
        { threshold: 0.3, rootMargin: "-20% 0px -60% 0px" }
      );

      const element = document.getElementById(`year-${item.year}`);
      if (element) observer.observe(element);
      observers.push(observer);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  const scrollToYear = (year: string) => {
    const element = document.getElementById(`year-${year}`);
    if (element) {
      const offset = 120; // Sticky header + tabs height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Update hash without jumping
      window.history.pushState(null, '', `#${year}`);
    }
  };

  return (
    <div className="relative">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-foreground origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* Sticky Tabs Navigation */}
      <nav className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-50 pt-20">
        <div className="w-full overflow-x-auto scrollbar-hide">
          <div className="flex px-4 md:px-12 space-x-8 md:space-x-12 w-full justify-center">
            {STORY_DATA.map((item) => (
              <button
                key={item.year}
                ref={(el) => { tabRefs.current[item.year] = el; }}
                onClick={() => scrollToYear(item.year)}
                className={cn(
                  "py-4 text-sm md:text-base font-medium transition-all relative whitespace-nowrap",
                  activeYear === item.year 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.year}
                {activeYear === item.year && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Timeline Content */}
      <div className="w-full px-0 py-16 space-y-32 md:space-y-48">
        {STORY_DATA.map((item, index) => (
          <section
            key={item.year}
            id={`year-${item.year}`}
            className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center overflow-hidden"
          >
            {/* Left Column: Text */}
            <div className={cn(
              "space-y-8 px-6 md:px-12 lg:px-24 py-12 lg:py-24",
              index % 2 === 1 ? "lg:order-2" : "lg:order-1"
            )}>
              <div className="space-y-4">
                <span className="text-sm font-semibold tracking-widest text-muted-foreground uppercase block">
                  Est. {item.year}
                </span>
                <h2 className="text-3xl md:text-5xl font-bold uppercase">
                  {item.title}
                </h2>
                <time dateTime={item.year} className="hidden">{item.year}</time>
              </div>
              
              <div className="prose prose-lg dark:prose-invert">
                <p className="text-xl md:text-2xl font-light leading-relaxed text-foreground/80">
                  {item.description}
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Key Milestones</h3>
                <ul className="grid grid-cols-1 gap-3">
                  {item.milestones.map((milestone, i) => (
                    <li key={i} className="flex items-center text-muted-foreground">
                      <span className="w-1.5 h-1.5 bg-foreground rounded-full mr-3" />
                      {milestone}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Image */}
            <div className={cn(
              "relative aspect-[4/5] lg:aspect-[3/4] group overflow-hidden bg-muted",
              index % 2 === 1 ? "lg:order-1" : "lg:order-2"
            )}>
              <Image
                src={item.image}
                alt={`${item.year} - ${item.title}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={index < 2}
              />
              {/* Optional Year Overlay for luxury feel */}
              <div className="absolute inset-x-0 bottom-0 p-8 flex justify-end items-end select-none pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                <span className="text-8xl md:text-9xl font-black text-white leading-none">
                  {item.year.slice(-2)}
                </span>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
