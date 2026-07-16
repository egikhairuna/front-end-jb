"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowUpRight, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useCurrency } from "@/lib/currency/context";


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
  const { currency, setCurrency } = useCurrency();

  // Hide footer on specific pages
  if (pathname === "/links") return null;

  const toggleSection = (title: string) => {
    setOpenSection(openSection === title ? null : title);
  };

  return (
    <footer className="bg-black   text-white pt-16 pb-8 px-6 md:px-8 lg:px-12 w-full border-t border-white/10">
      <div className="w-full">
        
        {/* TOP SECTION: Grid on Desktop, Stack on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 border-b border-white/10 pb-16">
          
          {/* 1. Newsletter (Full width on mobile, Col 1 on desktop) */}
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold font-heading uppercase leading-tight">
              Subscribe to the Newsletter
            </h2>
            <p className="text-[13px] text-neutral-400 max-w-sm font-sans font-medium tracking-normal leading-relaxed uppercase">
              Create an account and get access to exclusive content, previews and special offers.
            </p>
            <div className="pt-2">
              <Link 
                href="/account/login"
                className="inline-block bg-white text-black border border-white hover:bg-black hover:text-white hover:border-white transition-colors px-3 py-1 text-sm font-medium uppercase tracking-widest rounded-none text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* 2-4. Navigation Links */}
          {/* DESKTOP VIEW */}
          <div className="hidden lg:contents">
             {footerSections.map((section) => (
                <div key={section.title} className="space-y-6">
                   <h3 className="text-[13px] font-bold tracking-widest uppercase text-neutral-400">
                      {section.title}
                   </h3>
                   <ul className="space-y-3">
                      {section.items.map((item) => (
                         <li key={item.label}>
                             <Link 
                                href={item.href} 
                                className="text-[12px] font-bold tracking-[0.1em] hover:text-neutral-400 transition-colors uppercase"
                             >
                                {item.label}
                             </Link>
                         </li>
                      ))}
                   </ul>
                   {section.title === "CUSTOMER CARE" && (
                     <div className="pt-2">
                       <CurrencySwitcherDropdown />
                     </div>
                   )}
                </div>
             ))}
          </div>

          {/* MOBILE VIEW (Accordion) */}
          <div className="lg:hidden space-y-4 w-full">
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
             <div className="pt-6">
                <CurrencySwitcherDropdown />
             </div>
          </div>
        </div>



        {/* COPYRIGHT (Bottom bar) */}
        <div className="pt-8 md:pt-12 flex flex-col-reverse md:flex-row justify-center items-center gap-4 text-[12px] font-medium tracking-widest text-neutral-500 uppercase">
           <p>James Boogie © 2026. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function CurrencySwitcherDropdown() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center gap-3 text-sm md:text-[12px] font-medium tracking-wide uppercase text-white">
      <span>Shop In :</span>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCurrency('IDR')}
          className={cn(
            "transition-all duration-200 hover:text-white uppercase tracking-wider text-sm md:text-[12px]",
            currency === 'IDR'
              ? "text-white font-bold border-b-2 border-white pb-0.5"
              : "text-neutral-500 font-medium pb-0.5 border-b-2 border-transparent"
          )}
        >
          IDR
        </button>
        <button
          onClick={() => setCurrency('USD')}
          className={cn(
            "transition-all duration-200 hover:text-white uppercase tracking-wider text-sm md:text-[12px]",
            currency === 'USD'
              ? "text-white font-bold border-b-2 border-white pb-0.5"
              : "text-neutral-500 font-medium pb-0.5 border-b-2 border-transparent"
          )}
        >
          USD
        </button>
      </div>
    </div>
  );
}
