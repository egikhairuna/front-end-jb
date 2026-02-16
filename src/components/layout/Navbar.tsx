"use client";

import Link from "next/link";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Menu, Search, X } from "lucide-react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SearchDrawer } from "@/components/layout/SearchDrawer";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Update scrolled state for color changes
      setIsScrolled(scrollY > 50);

      // Visibility logic
      if (scrollY <= 0 || isOpen) {
        setIsVisible(true);
      } else {
        const diff = scrollY - lastScrollY.current;
        
        // Hide on scroll down if past threshold
        if (diff > 5 && scrollY > 100) {
          setIsVisible(false);
        } 
        // Show immediately on any scroll up
        else if (diff < -5) {
          setIsVisible(true);
        }
      }
      
      lastScrollY.current = scrollY > 0 ? scrollY : 0;
    };

    setIsMounted(true);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen]);
  
  const isTransparent = isHome && !isScrolled && !isHeaderHovered && !activeMenu;
  
  const navLinks = [
    { href: "/shop", label: "SHOP" },
    { href: "/journal", label: "JOURNAL" },
    { href: "#", label: "THE BRAND" },
  ];

  const shopMenu = {
    products: [
      { label: "ALL PRODUCTS", href: "/shop?category=all-products" },
      { label: "ACCESSORIES", href: "/shop?category=seasoning" },
      { label: "JACKETS", href: "/shop?category=jackets" },
      { label: "SHORTS & TROUSERS", href: "/shop?category=shorts-trousers" },
      { label: "POLO SHIRTS", href: "/shop?category=polo-shirt" },
      { label: "T-SHIRTS", href: "/shop?category=t-shirt" },
      { label: "SHIRTS", href: "/shop?category=shirt" },
    ],
    focusOn: [
      { label: "LOFTY", href: "/shop?category=lofty" },
      { label: "FANCY", href: "/shop?category=fancy" },
      { label: "FROLIC", href: "/shop?category=frolic" },
      { label: "JAMES BOOGIE | MATERNAL DISASTER", href: "/shop?category=james-boogie-maternal-disaster" },
      { label: "VENTILE®", href: "/shop?category=ventile" },
      { label: "MOXIE", href: "/shop?category=moxie" },
    ]
  };

  return (
    <header 
      onMouseEnter={() => {
        if (typeof window !== 'undefined' && window.innerWidth >= 768) {
          setIsHeaderHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (typeof window !== 'undefined' && window.innerWidth >= 768) {
          setIsHeaderHovered(false);
        }
      }}
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-300 ease-in-out transform-gpu",
        isVisible ? "translate-y-0" : "-translate-y-full",
        isTransparent 
          ? "bg-transparent border-transparent" 
          : "bg-white border-b border-black/5 shadow-sm"
      )}
    >
      <SearchDrawer 
        open={isSearchOpen} 
        onOpenChange={setIsSearchOpen} 
        triggerClassName="hidden" // Hidden trigger because we use custom buttons
      />
      <div className="mx-auto px-4 md:px-8 lg:px-12 flex h-20 items-center">
        {/* MOBILE LAYOUT */}
        <div className="flex w-full items-center md:hidden h-full">
          <div className="flex-1">
            {!isMounted ? (
              <Button variant="ghost" className={cn("px-0 hover:bg-transparent focus-visible:bg-transparent", isTransparent && !isOpen ? "text-white" : "text-black")}>
                <Menu className="h-6 w-6" />
              </Button>
            ) : (
              <Sheet open={isOpen} onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) setActiveMenu(null);
              }}>
                <SheetTrigger asChild>
                  <Button variant="ghost" className={cn("px-0 hover:bg-transparent focus-visible:bg-transparent", isTransparent && !isOpen ? "text-white" : "text-black")}>
                    <Menu className="h-8 w-8" />
                  </Button>
                </SheetTrigger>
                <SheetContent side={"fade" as any} className="w-full h-full p-0 bg-gradient-to-b from-[#0a1128] via-[#020617] to-black border-none flex flex-col animate-in animate-out fade-in fade-out duration-500 z-[200] [&>button]:hidden">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  
                  {/* Header with Centered Logo and Close Button */}
                  <div className="relative flex items-center justify-between px-6 h-20 border-b border-white/10">
                    {/* Close Button (Left aligned to match Hamburger icon position) */}
                    <Button 
                      variant="ghost" 
                      onClick={() => setIsOpen(false)} 
                      className="p-0 h-10 w-10 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="h-8 w-8 text-white" />
                    </Button>

                    {/* Centered Logo (Matches main navbar positioning) */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <Link href="/" onClick={() => setIsOpen(false)}>
                        <Image 
                          src="/logo-text.svg" 
                          alt="JamesBoogie" 
                          width={140} 
                          height={35} 
                          className="h-6 w-auto brightness-0 invert"
                        />
                      </Link>
                    </div>
                    
                    {/* Right spacer to keep symmetry */}
                    <div className="w-10"></div>
                  </div>
                  
                  {/* Navigation Menu */}
                  <nav className="flex-1 flex flex-col w-full px-6 py-4 overflow-y-auto">
                    {/* SHOP - with submenu */}
                    <div className="border-b border-white/10">
                      <button
                        onClick={() => setActiveMenu(activeMenu === "SHOP" ? null : "SHOP")}
                        className="w-full flex items-center justify-between py-4 text-sm font-regular tracking-wider text-white uppercase"
                      >
                        SHOP
                        {activeMenu === "SHOP" ? (
                          <IoIosArrowUp className="text-lg text-white" />
                        ) : (
                          <IoIosArrowDown className="text-lg text-white" />
                        )}
                      </button>
                      <div className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        activeMenu === "SHOP" ? "max-h-[800px] opacity-100 mb-4" : "max-h-0 opacity-0"
                      )}>
                        <div className="pl-4 space-y-6 pb-2">
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">Products</h4>
                            {shopMenu.products.map((item) => (
                              <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="block text-sm font-medium text-neutral-400 hover:text-white transition-colors uppercase"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">Focus On</h4>
                            {shopMenu.focusOn.map((item) => (
                              <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="block text-sm font-medium text-neutral-400 hover:text-white transition-colors uppercase"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* JOURNAL - direct link */}
                    <div className="border-b border-white/10">
                      <Link
                        href="/journal"
                        onClick={() => setIsOpen(false)}
                        className="block py-4 text-sm font-regular tracking-wider text-white uppercase hover:opacity-50 transition-opacity"
                      >
                        JOURNAL
                      </Link>
                    </div>

                    {/* THE BRAND - with submenu */}
                    <div className="border-b border-white/10">
                      <button
                        onClick={() => setActiveMenu(activeMenu === "THE BRAND" ? null : "THE BRAND")}
                        className="w-full flex items-center justify-between py-4 text-sm font-regular tracking-wider text-white uppercase"
                      >
                        THE BRAND
                        {activeMenu === "THE BRAND" ? (
                          <IoIosArrowUp className="text-lg text-white" />
                        ) : (
                          <IoIosArrowDown className="text-lg text-white" />
                        )}
                      </button>
                      <div className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        activeMenu === "THE BRAND" ? "max-h-[500px] opacity-100 mb-4" : "max-h-0 opacity-0"
                      )}>
                        <div className="pl-4 space-y-3 pb-2">
                          <Link
                            href="/our-story"
                            onClick={() => setIsOpen(false)}
                            className="block text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                          >
                            OUR STORY
                          </Link>
                          <Link
                            href="/our-people"
                            onClick={() => setIsOpen(false)}
                            className="block text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                          >
                            OUR PEOPLE
                          </Link>
                          <Link
                            href="/ventile"
                            onClick={() => setIsOpen(false)}
                            className="block text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                          >
                            VENTILE®
                          </Link>
                        </div>
                      </div>
                    </div>
                  </nav>

                   {/* Bottom Section - Social Icons and Search Trigger */}
                   <div className="p-6 border-t border-white/10 bg-black/20 flex items-center justify-between">
                     <div className="flex items-center gap-6">
                       <Link 
                         href="https://www.instagram.com/james.boogie/" 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-white hover:text-neutral-400 transition-colors"
                       >
                         <Instagram className="h-5 w-5" />
                       </Link>
                       <Link 
                         href="https://www.facebook.com/jamesboogieid" 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-white hover:text-neutral-400 transition-colors"
                       >
                         <Facebook className="h-5 w-5" />
                       </Link>
                     </div>
 
                     <button 
                       onClick={() => {
                         setIsOpen(false);
                         setIsSearchOpen(true);
                       }}
                       className="text-white p-0 hover:bg-transparent transition-opacity"
                     >
                       <Search className="h-5 w-5" />
                     </button>
                   </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
          
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
             <Link href="/">
                <Image 
                   src="/logo-text.svg" 
                   alt="JamesBoogie" 
                   width={140} 
                   height={35} 
                   className={cn("h-6 w-auto transition-all", isTransparent ? "brightness-0 invert" : "")}
                />
             </Link>
          </div>
          
          <div className="flex-1 flex justify-end">
             <CartDrawer triggerClassName={cn(isTransparent ? "text-white" : "text-black")} />
          </div>
        </div>

        {/* DESKTOP LAYOUT (Three Columns) */}
        <div className="hidden md:grid md:grid-cols-3 w-full items-center h-full">
          {/* LEFT: LINKS */}
          <nav className="flex items-center gap-8 text-sm font-bold tracking-[0.2em] h-full">
             {navLinks.map((link) => (
                <div
                  key={link.href}
                  className="h-full flex items-center"
                  onMouseEnter={() => setActiveMenu(link.label)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <Link
                      href={link.href}
                      className={cn(
                        "transition-colors hover:opacity-50 h-full flex items-center",
                        isTransparent ? "text-white" : "text-[#1a1a1a]"
                      )}
                  >
                      {link.label}
                  </Link>
                </div>
             ))}
          </nav>

          {/* CENTER: LOGO */}
          <div className="flex justify-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo-text.svg" 
                alt="JamesBoogie" 
                width={200} 
                height={50} 
                className={cn("h-7 w-auto transition-all", isTransparent ? "brightness-0 invert" : "")}
              />
            </Link>
          </div>

          {/* RIGHT: ICONS */}
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className={cn("p-2 hover:opacity-50 transition-opacity", isTransparent ? "text-white" : "text-black")}
            >
              <Search className="h-4 w-4" />
            </button>
            <CartDrawer triggerClassName={cn(isTransparent ? "text-white" : "text-black")} />
          </div>
        </div>
      </div>

      {/* SHOP MEGAMENU */}
      <div 
        className={cn(
          "absolute top-full left-0 w-full bg-white border-b border-black/10 transition-all duration-500 ease-in-out overflow-hidden hidden md:block",
          activeMenu === "SHOP" ? "max-h-[600px] opacity-100 visible" : "max-h-0 opacity-0 invisible"
        )}
        onMouseEnter={() => setActiveMenu("SHOP")}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div className="w-full grid grid-cols-3 h-full min-h-[400px]">
          {/* Column 1: Products */}
          <div className="p-12 border-r border-black/10 space-y-8 h-full">
            <div className="space-y-4">
              <h3 className="text-sm font-bold tracking-[0.2em] text-black uppercase pt-4">PRODUCTS</h3>
              <ul className="space-y-3 pt-2">
                {shopMenu.products.filter(item => item.label !== "ALL PRODUCTS").map((item) => (
                  <li key={item.label} className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-400 font-bold tracking-tighter">&gt;</span>
                    <Link 
                      href={item.href} 
                      className="text-sm font-bold tracking-[0.15em] text-neutral-600 hover:text-black transition-colors uppercase"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 2: Focus On */}
          <div className="p-12 border-r border-black/10 space-y-8 h-full">
            <div className="space-y-4">
              <h3 className="text-sm font-bold tracking-[0.2em] text-black uppercase">FOCUS ON</h3>
              <ul className="space-y-3 pt-2">
                {shopMenu.focusOn.map((item) => (
                  <li key={item.label} className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-400 font-bold tracking-tighter">&gt;</span>
                    <Link 
                      href={item.href} 
                      className="text-sm font-bold tracking-[0.15em] text-neutral-600 hover:text-black transition-colors uppercase"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 3: Featured Image Placeholder */}
          <div className="p-12 h-full flex flex-col justify-center items-center bg-neutral-50/50">
            <div className="aspect-[3/4] w-full max-w-[280px] bg-neutral-100 border border-black/5 relative group cursor-pointer transition-all hover:bg-neutral-200 flex flex-col items-center justify-center">
                <Image
                  src="/images/featured-lofty.jpg"
                  alt="Lofty"
                  width={280}
                  height={373}
                  className="w-full h-auto"
                />
            </div>
          </div>
        </div>
      </div>

      {/* THE BRAND MEGAMENU */}
      <div 
        className={cn(
          "absolute top-full left-0 w-full bg-white border-b border-black/5 transition-all duration-500 ease-in-out overflow-hidden hidden md:block",
          activeMenu === "THE BRAND" ? "max-h-[600px] opacity-100 visible" : "max-h-0 opacity-0 invisible"
        )}
        onMouseEnter={() => setActiveMenu("THE BRAND")}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div className="mx-auto px-4 md:px-8 lg:px-12 py-12 grid grid-cols-3">
          {[
            { title: "OUR STORY", href: "/our-story", img: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/Wallpaper_Moxie_Potrait_FHD.jpg" },
            { title: "OUR PEOPLE", href: "/our-people", img: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/our-people.jpg" },
            { title: "VENTILE®", href: "/ventile", img: "https://vps.jamesboogie.com/wp-content/uploads/2026/02/ventile-poster-scaled.jpg" }
          ].map((item, index) => (
            <Link 
              key={index} 
              href={item.href} 
              className="flex flex-col gap-2 w-full group"
            >
              <div className="aspect-[4/3] bg-neutral-100 overflow-hidden relative border border-black/5">
                <Image 
                  src={item.img} 
                  alt={item.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              </div>
              <div className="py-2">
                <h3 className="px-4 text-[20px] font-medium text-black group-hover:underline">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
