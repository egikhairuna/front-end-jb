
"use client";

import { useCartStore } from "@/lib/store/cart";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Minus, Plus, Trash2, Handbag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { formatPrice, cleanPrice, cn } from "@/lib/utils";

export function CartDrawer({ triggerClassName }: { triggerClassName?: string }) {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, getCartTotal } = useCartStore();
  
  // Hydration fix
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true) }, []);

  if (!isMounted) return null;

  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", triggerClassName)}>
          <Handbag className="h-10 w-10" />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-black text-white text-[10px] flex items-center justify-center rounded-full">
              {items.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>SUMMARY</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
               <Handbag className="h-16 w-16 text-muted-foreground" />
               <p className="text-muted-foreground">Your cart is empty</p>
               <Button variant="outline" onClick={toggleCart}>Continue Shopping</Button>
            </div>
          ) : (
            <div className="space-y-4 px-2">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.variation?.id || 'base'}`} className="flex space-x-4">
                  <div className="relative h-20 w-20 rounded-md overflow-hidden bg-secondary">
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
                            Variant: {item.variation.name}
                        </p>
                    )}
                    <p className="text-sm font-semibold">
                      {item.variation?.price ? cleanPrice(item.variation.price) : (item.product.price ? cleanPrice(item.product.price) : formatPrice(0))}
                    </p>
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
                <div className="grid gap-2 px-4">
                    <Button asChild className="w-full" onClick={toggleCart}>
                        <Link href="/checkout">CHECKOUT</Link>
                    </Button>
                </div>
            </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
