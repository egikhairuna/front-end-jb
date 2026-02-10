import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Product } from "@/types/woocommerce";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
    const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);
    
    // Remove &nbsp; or \u00a0 and return cleaned string
    return formatted.replace(/\u00a0/g, " ").replace(/&nbsp;/g, " ");
}

export function cleanPrice(price: string): string {
    if (!price) return "";
    // Remove &nbsp; or \u00a0 and return cleaned string
    return price.replace(/\u00a0/g, " ").replace(/&nbsp;/g, " ");
}

/**
 * Sorts products to bring in-stock items to the top
 */
export function sortProductsByStock(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const aInStock = a.stockStatus !== 'OUT_OF_STOCK';
    const bInStock = b.stockStatus !== 'OUT_OF_STOCK';
    
    if (aInStock && !bInStock) return -1;
    if (!aInStock && bInStock) return 1;
    return 0;
  });
}

