"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Instagram, 
  Youtube,
  ShoppingBag, 
  MessageCircle, 
  Info, 
  BookOpen, 
  ChevronRight,
  ArrowLeft,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  {
    title: "FANCY",
    href: "/shop",
    icon: <ShoppingBag className="w-5 h-5" />
  },
  {
    title: "JACKETS",
    href: "/shop?category=jackets",
    icon: <ShoppingBag className="w-5 h-5" />
  },
  {
    title: "ACCESSORIES",
    href: "/shop?category=seasoning",
    icon: <Info className="w-5 h-5" />
  },
  {
    title: "JOURNAL",
    href: "/journal",
    icon: <BookOpen className="w-5 h-5" />
  },
  {
    title: "Ventile®",
    href: "/shop?category=ventile",
    icon: <MessageCircle className="w-5 h-5" />,
    external: true
  }
];

const socials = [
  { icon: <Instagram className="w-7 h-6" />, href: "https://instagram.com/james.boogie/", label: "Instagram" },
  { 
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-6">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    ), 
    href: "https://wa.me/6285157000263", 
    label: "WhatsApp" 
  },
  { icon: <Youtube className="w-8 h-8" />, href: "https://www.youtube.com/@jamesboogie9176", label: "YouTube" }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
} as const;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
} as const;

export default function LinksPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-white selection:text-[#020617]">
      {/* Background Gradient - Navy to Black */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a1128] via-[#020617] to-black" />
      
      {/* Background Decor - Subtle Industrial Feel */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.05]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] border border-white rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] border border-white rounded-full" />
      </div>

      <main className="relative z-10 max-w-xl mx-auto px-6 py-16 flex flex-col items-center">
        {/* Navigation - Minimal Home Link */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-8 left-6"
        >
        </motion.div>

        {/* Header Section */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mb-4 flex flex-col items-center"
        >
          <div className="relative mb-8 pt-4">
             <Image 
                src="/logo-james.svg" 
                alt="James Boogie" 
                width={120} 
                height={120} 
                className="w-auto h-40 brightness-0 invert"
             />
          </div>
          <p className="text-base font-medium text-white uppercase text-center max-w-full">
            The Pop Military Brand, and a symbol of strong, elegant, iconic, and flawless fashion
          </p>
        </motion.div>

                  <div className="flex items-center gap-6">
            {socials.map((social) => (
              <Link 
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-all duration-300"
                aria-label={social.label}
              >
                {social.icon}
              </Link>
            ))}
          </div>

        {/* Featured Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="w-full mb-8"
        >
          <div className="flex justify-center mb-4 mt-14">
             <h2 className="text-sm font-medium text-white uppercase">OUT NOW !</h2>
          </div>
          
          <Link href="/shop?category=new-lofty" className="block group relative aspect-[4/3] w-full overflow-hidden rounded-xl">
            <Image 
              src="/hero/Hero.jpg" 
              alt="SS026 Campaign" 
              fill
              className="object-cover transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
               <span className="text-sm font-mono text-white/90 font-semibold uppercase tracking-widest bg-black/50 backdrop-blur-md px-2 py-1 rounded">
                 LOFTY '026
               </span>
               <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white">
                  <ArrowUpRight className="w-4 h-4" />
               </div>
            </div>
          </Link>
        </motion.div>

        {/* Links Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full space-y-4 mb-16"
        >
          {links.map((link) => (
            <motion.div key={link.href} variants={itemVariants}>
              <Link 
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className={cn(
                  "group relative flex items-center justify-center w-full p-4 rounded-xl border border-white/70 transition-all duration-300",
                  "bg-transparent backdrop-blur-md hover:bg-white hover:text-black hover:border-white hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:-translate-y-1"
                )}
              >
                <div className="text-center">
                  <span className="block text-sm font-bold tracking-[0.1em] uppercase">{link.title}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Socials & Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center gap-8"
        > 
          <div className="text-[9px] font-bold tracking-[0.3em] text-white/30 uppercase">
            JAMES BOOGIE © 2026
          </div>
        </motion.div>
      </main>
    </div>
  );
}
