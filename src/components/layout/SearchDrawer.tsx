"use client";

import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function SearchDrawer({ triggerClassName, open: externalOpen, onOpenChange: externalOnOpenChange }: { 
  triggerClassName?: string,
  open?: boolean,
  onOpenChange?: (open: boolean) => void 
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const onOpenChange = externalOnOpenChange !== undefined ? externalOnOpenChange : setInternalOpen;
  
  const [query, setQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <button className={cn("p-2 hover:opacity-50 transition-opacity", triggerClassName)}>
        <Search className="h-4 w-4" />
      </button>
    );
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
        onOpenChange(false);
        router.push(`/shop?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <button className={cn("p-2 hover:opacity-50 transition-opacity", triggerClassName)}>
          <Search className="h-4 w-4" />
        </button>
      </SheetTrigger>
      {/* Side="fade" for full-screen appearance. Adjusted classes for full height and width. */}
      {/* Increased z-index to z-[150] to stay above the navbar (z-[100]) */}
      <SheetContent side={"fade" as any} className="w-full h-full flex flex-col pt-4 md:pt-10 pb-0 bg-white border-none [&>button]:hidden shadow-none rounded-none animate-in animate-out fade-in fade-out duration-300 z-[150]">
        <SheetTitle className="sr-only">Search</SheetTitle>
        <div className="w-full h-full flex flex-col relative px-4 md:px-8 lg:px-12">
            {/* Header */}
            <div className="flex justify-between items-center mb-16 md:mb-24">
                <span className="text-sm font-bold tracking-[0.2em] uppercase">Search</span>
                <SheetClose asChild>
                    <button className="flex items-center justify-center p-2 hover:opacity-50 transition-opacity">
                        <X className="h-8 w-8 text-black" />
                    </button>
                </SheetClose>
            </div>

            {/* Input Section */}
            <div className="max-w-4xl w-full mx-auto">
                <div className="w-full relative">
                    <input
                        type="text"
                        placeholder="Type to search"
                        className="w-full text-3xl md:text-5xl lg:text-7xl font-bold border-b border-black/10 py-6 md:py-10 focus:outline-none placeholder:text-neutral-200 font-heading uppercase tracking-tighter bg-transparent"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        autoFocus
                    />
                </div>
                
                <p className="mt-6 md:mt-10 text-[10px] md:text-sm text-neutral-400 uppercase tracking-[0.2em] font-bold">
                    Press Enter to search
                </p>
            </div>
            
            {/* Future Placeholder for Featured/Recent: Could be added here */}
        </div>
      </SheetContent>
    </Sheet>
  );
}
