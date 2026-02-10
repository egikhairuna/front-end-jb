"use client";

import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function SearchDrawer({ triggerClassName }: { triggerClassName?: string }) {
  const [open, setOpen] = useState(false);
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
        setOpen(false);
        router.push(`/shop?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className={cn("p-2 hover:opacity-50 transition-opacity", triggerClassName)}>
          <Search className="h-4 w-4" />
        </button>
      </SheetTrigger>
      {/* Side="right" for side drawer. Adjusted classes for full height and proper width. */}
      {/* sm:max-w-md provides a nice medium width for the sidebar */}
      <SheetContent side="right" className="w-[400px] sm:max-w-md h-full flex flex-col pt-10 pb-0 bg-white [&>button]:hidden">
        <SheetTitle className="sr-only">Search</SheetTitle>
        <div className="w-full h-full flex flex-col relative px-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-neutral-100">
                <span className="text-sm font-bold tracking-widest uppercase">Search</span>
                <SheetClose asChild>
                    <button className="flex items-center gap-2 text-sm font-medium tracking-widest uppercase hover:opacity-50 transition-opacity">
                        Close <X className="h-4 w-4" />
                    </button>
                </SheetClose>
            </div>

            {/* Input */}
            <div className="w-full">
                <input
                    type="text"
                    placeholder="Product name..."
                    className="w-full text-xl md:text-2xl font-light border-b border-gray-200 py-4 focus:outline-none placeholder:text-gray-300 font-dinpro bg-transparent"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    autoFocus
                />
            </div>
            
            <p className="mt-4 text-xs text-muted-foreground uppercase tracking-wider">
                Press Enter to search
            </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
