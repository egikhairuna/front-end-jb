
"use client";

import { useCartStore } from "@/lib/store/cart";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { PiShoppingBag } from "react-icons/pi";
import Image from "next/image";

import { Separator } from "@/components/ui/separator";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatPrice, cleanPrice, cn } from "@/lib/utils";
import { CartItem } from "@/types/woocommerce";
import { toast } from "sonner";

const getVariantName = (item: CartItem) => {
  if (!item.variation) return null;
  
  // Try to find size attribute first
  const sizeAttr = item.variation.attributes?.nodes?.find(
    attr => attr.name.toLowerCase().includes('size')
  );
  if (sizeAttr) return sizeAttr.value;

  // Fallback: Strip product name from variation name if it's a prefix
  const productName = item.product.name;
  if (item.variation.name.startsWith(productName)) {
    const nameWithoutProduct = item.variation.name.replace(productName, "").replace(/^[\s-–—]+/, "").trim();
    if (nameWithoutProduct) return nameWithoutProduct;
  }

  // Last resort: take the last part after hyphen
  return item.variation.name.split('-').pop()?.trim() || item.variation.name;
};

export function CartDrawer({ triggerClassName }: { triggerClassName?: string }) {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, getCartTotal } = useCartStore();
  const router = useRouter();

  // Hydration fix
  const [isMounted, setIsMounted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  useEffect(() => { setIsMounted(true) }, []);

  // Clear error when cart changes (user removed the item)
  useEffect(() => { setValidationError(null); }, [items]);

  const validateStockItems = useCallback(async (isCheckout = false) => {
    if (items.length === 0) return true;
    
    if (!isCheckout) setIsValidating(true);
    setValidationError(null);

    try {
      const payload = items.map((item) => ({
        productId: item.product.databaseId || parseInt(item.product.id),
        variationId: item.variation?.databaseId,
        name: item.product.name,
      }));

      const res = await fetch('/api/products/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payload }),
      });

      const data = await res.json();

      if (data.unavailable && data.unavailable.length > 0) {
        // Auto-remove unavailable items if just opening the drawer
        if (!isCheckout) {
          data.unavailable.forEach((unItem: any) => {
            removeItem(unItem.id.toString(), unItem.variationId?.toString());
            toast.error(`"${unItem.name}" was removed from cart as it is no longer available.`);
          });
          return false;
        }

        const first = data.unavailable[0];
        const reason = first.reason === 'out_of_stock'
          ? `"${first.name}" is currently out of stock. Please remove it from your cart.`
          : `"${first.name}" is no longer available and cannot be ordered. Please remove it from your cart.`;
        setValidationError(reason);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Validation error:", error);
      return true; // Proceed on network errors to avoid blocking users
    } finally {
      if (!isCheckout) setIsValidating(false);
    }
  }, [items, removeItem]);

  // Auto-validate when drawer opens
  useEffect(() => {
    if (isOpen && items.length > 0) {
      validateStockItems();
    }
  }, [isOpen]); // Only trigger when isOpen changes to true

  const handleCheckout = useCallback(async () => {
    setIsValidating(true);
    const isValid = await validateStockItems(true);
    
    if (isValid) {
      toggleCart();
      router.push('/checkout');
    }
    
    setIsValidating(false);
  }, [validateStockItems, router, toggleCart]);

  if (!isMounted) return null;

  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetTrigger asChild>
        <Button variant="ghost" className={cn("relative p-0 hover:bg-transparent hover:opacity-50 transition-colors cursor-pointer", triggerClassName)}>
          {/* Desktop Version: Text BAG [10] */}
          <span className="hidden lg:inline-flex items-center text-[13px] font-regular tracking-[0.2em] px-3 py-2">
            CART {items.length > 0 ? `[${items.reduce((acc, item) => acc + item.quantity, 0)}]` : ""}
          </span>
          
          {/* Mobile Version: Icon */}
          <div className="lg:hidden relative p-2">
            {items.length > 0 ? (
              <div className="flex flex-col items-center justify-center -mt-[2px] transition-all">
                {/* Bag Handle - Flat bar */}
                <div className={cn(
                  "h-[2.5px] w-2 rounded-t-[0.5px] mb-[0.5px]",
                  triggerClassName?.includes("text-white") ? "bg-white" : "bg-black"
                )} />
                {/* Bag Body - Square */}
                <div className={cn(
                  "w-[16px] h-[16px] flex items-center justify-center",
                  triggerClassName?.includes("text-white") ? "bg-white" : "bg-black"
                )}>
                  <span className={cn(
                    "text-[11px] font-bold font-mono tracking-tighter leading-none",
                    triggerClassName?.includes("text-white") ? "text-black" : "text-white"
                  )}>
                    {items.reduce((acc, item) => acc + item.quantity, 0).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            ) : (
              <Image 
                  src="/cart.svg" 
                  alt="Cart" 
                  width={20} 
                  height={20} 
                  className={cn("size-5 transition-all", triggerClassName?.includes("text-white") ? "brightness-0 invert" : "")}
              />
            )}
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent aria-describedby={undefined} className="flex flex-col w-full sm:max-w-md z-[200] [&>button]:hidden">
        <SheetHeader className="flex flex-row items-center justify-between border-b pb-4 px-6">
          <SheetTitle className="text-[13px] font-medium tracking-[0.2em] uppercase">Order Summary</SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-transparent -mr-2">
               <X className="h-7 w-7" />
            </Button>
          </SheetClose>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
               <PiShoppingBag className="h-17 w-17 text-muted-foreground" />
               <p className="text-muted-foreground">Your cart is empty</p>
               <Button variant="outline" onClick={toggleCart}>Continue Shopping</Button>
            </div>
          ) : (
            <div className="space-y-4 px-2">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.variation?.id || 'base'}`} className="flex space-x-4">
                  <div className="relative w-20 aspect-[4/5] rounded-md overflow-hidden bg-secondary">
                     {item.product.image?.sourceUrl && (
                        <Image 
                            src={item.product.image.sourceUrl} 
                            alt={item.product.image.altText || item.product.name}
                            fill
                            className="object-cover"
                        />
                     )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-medium leading-none">{item.product.name}</h4>
                    {item.variation && (
                        <p className="text-xs text-muted-foreground capitalize">
                            Variant: {getVariantName(item)}
                        </p>
                    )}
                    <p className="text-sm font-semibold">
                      {item.variation?.price ? cleanPrice(item.variation.price) : (item.product.price ? cleanPrice(item.product.price) : formatPrice(0))}
                    </p>
                    
                    {/* Quantity & Stock Validation */}
                    {(() => {
                      const stockLimit = item.variation ? item.variation.stockQuantity : item.product.stockQuantity;
                      const isMaxReached = stockLimit !== null && stockLimit !== undefined && item.quantity >= stockLimit;
                      
                      return (
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2">
                              <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variation?.id)}
                              >
                                  <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm w-4 text-center">{item.quantity}</span>
                              <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  disabled={isMaxReached}
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variation?.id)}
                              >
                                  <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive ml-auto"
                                  onClick={() => removeItem(item.product.id, item.variation?.id)}
                              >
                                   <Trash2 className="h-3 w-3" />
                              </Button>
                          </div>
                          {isMaxReached && stockLimit !== null && (
                            <p className="text-[10px] text-destructive font-medium uppercase tracking-widest">
                              Maximum quantity reached
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
            <div className="border-t pt-4 space-y-4 pb-20">
                <div className="flex justify-between px-4 text-base font-medium">
                    <span>Total</span>
                    <span>{formatPrice(getCartTotal())}</span>
                </div>
                {validationError && (
                  <p className="px-4 text-[11px] text-red-600 font-medium leading-snug">
                    {validationError}
                  </p>
                )}
                <div className="grid gap-2 px-4">
                    <button
                      className="w-full bg-black text-white py-3 text-sm font-bold tracking-widest uppercase hover:bg-neutral-800 transition-colors disabled:opacity-50"
                      onClick={handleCheckout}
                      disabled={isValidating}
                    >
                      {isValidating ? 'CHECKING...' : 'CHECKOUT'}
                    </button>
                </div>
            </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
