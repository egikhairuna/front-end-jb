"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowUpRight, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

// Types for navigation items
type FooterItem = {
  label: string;
  href: string;
};

type FooterSection = {
  title: string;
  items: FooterItem[];
};

const footerSections: FooterSection[] = [
  {
    title: "ABOUT",
    items: [
      { label: "OUR STORY", href: "/our-story" },
      { label: "VENTILE®", href: "/ventile" },
      { label: "OUR PEOPLE", href: "/our-people" },
    ],
  },
  {
    title: "LEGAL AREA",
    items: [
      { label: "RETURNS & REFUNDS", href: "/returns-refunds" },
      { label: "PRIVACY POLICY", href: "/privacy-policy" },
    ],
  },
  {
    title: "CUSTOMER CARE",
    items: [
      { label: "HOW TO ORDER", href: "/how-to-order" },
      { label: "FAQ", href: "/faq" },
      { label: "CONTACT US", href: "/contact-us" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Hide footer on specific pages
  if (pathname === "/links") return null;

  const toggleSection = (title: string) => {
    setOpenSection(openSection === title ? null : title);
  };

  return (
    <footer className="bg-black   text-white pt-16 pb-8 px-4 md:px-8 lg:px-12 w-full border-t border-white/10">
      <div className="mx-auto max-w-[1920px]">
        
        {/* TOP SECTION: Grid on Desktop, Stack on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/10 pb-16">
          
          {/* 1. Newsletter (Full width on mobile, Col 1 on desktop) */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold font-heading uppercase leading-tight">
              Subscribe to the Newsletter
            </h2>
            <p className="text-sm text-neutral-400 max-w-sm">
              Join our community and get access to exclusive content, previews and special offers.
            </p>
          </div>

          {/* 2-4. Navigation Links */}
          {/* DESKTOP VIEW */}
          <div className="hidden md:contents">
             {footerSections.map((section) => (
                <div key={section.title} className="space-y-6">
                   <h3 className="text-sm font-bold tracking-widest uppercase text-neutral-400">
                      {section.title}
                   </h3>
                   <ul className="space-y-3">
                      {section.items.map((item) => (
                         <li key={item.label}>
                             <Link 
                                href={item.href} 
                                className="text-sm font-bold tracking-[0.1em] hover:text-neutral-400 transition-colors uppercase"
                             >
                                {item.label}
                             </Link>
                         </li>
                      ))}
                   </ul>
                </div>
             ))}
          </div>

          {/* MOBILE VIEW (Accordion) */}
          <div className="md:hidden space-y-4 w-full">
             {footerSections.map((section) => (
                <div key={section.title} className="border-b border-white/10 last:border-none">
                   <button 
                      onClick={() => toggleSection(section.title)}
                      className="flex items-center justify-between w-full py-4 text-left"
                   >
                      <h3 className="text-sm font-bold tracking-widest uppercase">
                         {section.title}
                      </h3>
                      {openSection === section.title ? (
                         <Minus className="h-4 w-4" />
                      ) : (
                         <Plus className="h-4 w-4" />
                      )}
                   </button>
                   <div 
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        openSection === section.title ? "max-h-[300px] opacity-100 pb-4" : "max-h-0 opacity-0"
                      )}
                   >
                      <ul className="space-y-4 pt-2">
                         {section.items.map((item) => (
                             <li key={item.label}>
                                 <Link 
                                    href={item.href} 
                                    className="text-[12px] font-medium tracking-wide text-neutral-300 hover:text-white uppercase flex items-center gap-2"
                                 >  
                                    {item.label}
                                 </Link>
                             </li>
                         ))}
                      </ul>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
           <div className="flex flex-col md:flex-row gap-8 items-start md:items-center w-full md:w-auto justify-between">              
           </div>
        </div>

        {/* COPYRIGHT (Bottom bar) */}
        <div className="pt-8 md:pt-12 flex flex-col-reverse md:flex-row justify-center items-center gap-4 text-[12px] font-medium tracking-widest text-neutral-500 uppercase">
           <p>James Boogie © 2026.All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
