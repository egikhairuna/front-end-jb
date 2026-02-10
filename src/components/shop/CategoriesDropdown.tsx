"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string;
  count: number;
};

type Props = {
  categories: Category[];
  currentCategory?: string;
};

export function CategoriesDropdown({ categories, currentCategory }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Find the current category name for display
  const currentCategoryName = currentCategory
    ? categories.find((cat) => cat.slug === currentCategory)?.name || "All Products"
    : "All Products";

  // Calculate total product count
  const totalCount = categories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div className="relative w-full max-w-xs">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 border border-black/20 bg-white hover:bg-neutral-50 transition-colors",
          isOpen && "bg-neutral-50"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">
            Category:
          </span>
          <span className="text-sm font-bold tracking-wider uppercase">
            {currentCategoryName}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-black/20 shadow-lg z-20 max-h-[400px] overflow-y-auto">
            <ul className="py-2">
              {/* All Products */}
              <li>
                <Link
                  href="/shop"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-4 py-2.5 text-sm font-bold tracking-wider uppercase transition-colors hover:bg-neutral-100",
                    !currentCategory
                      ? "bg-black text-white hover:bg-black"
                      : "text-neutral-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>All Products</span>
                    <span className="text-xs font-medium opacity-60">
                      ({totalCount})
                    </span>
                  </div>
                </Link>
              </li>

              {/* Category Items */}
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block px-4 py-2.5 text-sm font-bold tracking-wider uppercase transition-colors hover:bg-neutral-100",
                      currentCategory === cat.slug
                        ? "bg-black text-white hover:bg-black"
                        : "text-neutral-700"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{cat.name}</span>
                      <span className="text-xs font-medium opacity-60">
                        ({cat.count})
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
