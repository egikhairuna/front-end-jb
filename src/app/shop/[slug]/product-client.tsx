
"use client";

import { useState } from "react";
import Image from "next/image";
import { Product, ProductVariation } from "@/types/woocommerce";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { formatPrice, cleanPrice, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Minus, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(undefined);
  const { addItem } = useCartStore();

  const variations = product.variations?.nodes || [];
  const galleryImages = [product.image, ...(product.galleryImages?.nodes || [])].filter(Boolean);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(["description", "style-fit"]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  const isVariableProduct = variations.length > 0;

  const handleAddToCart = () => {
    if (isVariableProduct && !selectedVariation) {
        toast.error("Please select a size");
        return;
    }

    addItem(product, quantity, selectedVariation);
    toast.success("Added to cart");
  };
  
  // Determine displayed price
  const displayPrice = selectedVariation ? cleanPrice(selectedVariation.price) : (product.price ? cleanPrice(product.price) : formatPrice(0));
  const isOutOfStock = selectedVariation ? selectedVariation.stockStatus === 'OUT_OF_STOCK' : product.stockStatus === 'OUT_OF_STOCK';

  return (
    <div className="w-full pt-20">
      <div className="mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-8 lg:gap-12">
          {/* Left Side - Scrollable Image Gallery */}
          <div className="w-full md:py-10 md:bg-white md:-mx-8 lg:-mx-12">
            {/* Mobile: Swipeable Carousel */}
            <div className="md:hidden -mx-4">
              <div className="relative">
                <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide flex">
                  {galleryImages.map((img, idx) => (
                    <div 
                      key={idx}
                      className="min-w-full snap-center"
                    >
                      <div 
                        className="relative aspect-[3/4] w-full bg-white active:scale-95 transition-transform"
                        onClick={() => setPreviewImage(img.sourceUrl)}
                      >
                        <Image 
                          src={img.sourceUrl} 
                          alt={img.altText || `${product.name} - Image ${idx + 1}`}
                          fill
                          className="object-cover"
                          priority={idx < 2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Dots Indicator */}
                {galleryImages.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {galleryImages.map((_, idx) => (
                      <div 
                        key={idx}
                        className="w-2 h-2 rounded-full bg-white/50 backdrop-blur-sm"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop: Two-Column Grid */}
            <div className="hidden md:grid grid-cols-2 w-full pl-10 mx-auto bg-white">
              {galleryImages.map((img, idx) => (
                <div 
                  key={idx}
                  className="relative aspect-[3/4] w-full bg-white overflow-hidden border border-neutral-200 hover:border-primary/50 transition-all cursor-zoom-in"
                  onClick={() => setPreviewImage(img.sourceUrl)}
                >
                  <Image 
                    src={img.sourceUrl} 
                    alt={img.altText || `${product.name} - Image ${idx + 1}`}
                    fill
                    className="object-cover"
                    priority={idx < 2}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Sticky Product Information */}
          <div className="lg:sticky lg:top-20 lg:self-start py-8 md:py-10">
            <div className="space-y-0 border border-neutral-300">
              {/* Product Info Section */}
              <div className="px-6 py-6 space-y-6">

                {/* Product Title */}
                <div>
                  <h1 className="text-2xl md:text-2xl font-eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeemedium tracking-wide mb-3 leading-tight uppercase tracking-wide">
                    {product.name}
                  </h1>
                  <div className="text-lg tracking-wide font-bold">
                    {displayPrice}
                  </div>
                </div>

                {/* Size Selection */}
                {isVariableProduct && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-bold uppercase tracking-wide">SIZE</span>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                       {variations
                        .map((variant) => {
                          // Extract size from attributes
                          const sizeAttr = variant.attributes?.nodes?.find(
                            attr => attr.name.toLowerCase().includes('size')
                          );
                          const displayName = sizeAttr?.value || variant.name.split('-').pop()?.trim() || variant.name;
                          
                          return {
                            variant,
                            displayName: displayName.toUpperCase(),
                          };
                        })
                        .sort((a, b) => {
                          // Define size order
                          const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
                          const indexA = sizeOrder.indexOf(a.displayName);
                          const indexB = sizeOrder.indexOf(b.displayName);
                          
                          // If both sizes are in the order array, sort by their position
                          if (indexA !== -1 && indexB !== -1) {
                            return indexA - indexB;
                          }
                          // If only one is in the array, prioritize it
                          if (indexA !== -1) return -1;
                          if (indexB !== -1) return 1;
                          // Otherwise, sort alphabetically
                          return a.displayName.localeCompare(b.displayName);
                        })
                        .map(({ variant, displayName }) => {
                         const isSelected = selectedVariation?.id === variant.id;
                         const isUnavailable = variant.stockStatus === 'OUT_OF_STOCK';
                         
                         return (
                           <button
                             key={variant.id}
                             onClick={() => !isUnavailable && setSelectedVariation(variant)}
                             className={cn(
                               "py-3 border text-xs font-medium transition-all uppercase",
                               isSelected && "bg-black text-white border-black",
                               !isSelected && !isUnavailable && "border-neutral-300 hover:border-black",
                               isUnavailable && "opacity-30 cursor-not-allowed line-through"
                             )}
                             disabled={isUnavailable}
                           >
                             {displayName}
                           </button>
                         );
                       })}
                    </div>
                  </div>
                )}

                {/* Add to Cart Buttons */}
                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    className="w-full h-14 bg-black text-white hover:bg-neutral-800 uppercase tracking-wide font-bold text-sm"
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                  >
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </div>
              </div>

              {/* Accordion Sections */}
              <div className="border-t border-neutral-300">
                {/* Description */}
                <AccordionItem 
                  title="Description" 
                  isOpen={openSections.includes('description')} 
                  onClick={() => toggleSection('description')}
                >
                  {product.description ? (
                    <div 
                      className="prose prose-sm max-w-none text-base leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: product.description }} 
                    />
                  ) : (
                    <p className="text-sm leading-relaxed">
                      No description available.
                    </p>
                  )}
                </AccordionItem>

                {/* Style & Fit */}
                {/* Style & Fit - Render only if sizeChart exists */}
                {product.sizeChart?.sizeChart && (
                  <AccordionItem 
                    title="Style & Fit" 
                    isOpen={openSections.includes('style-fit')} 
                    onClick={() => toggleSection('style-fit')}
                  >
                    <div 
                      className="prose prose-sm max-w-none text-base leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: product.sizeChart.sizeChart }} 
                    />
                  </AccordionItem>
                )}

                {/* Features */}
                {/* Features - Render only if features exists */}
                {product.features?.features && (
                  <AccordionItem 
                    title="Features" 
                    isOpen={openSections.includes('features')} 
                    onClick={() => toggleSection('features')}
                  >
                     <div 
                      className="prose prose-sm max-w-none text-base leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: product.features.features }} 
                    />
                  </AccordionItem>
                )}

                {/* Care */}
                <AccordionItem 
                  title="Care" 
                  isOpen={openSections.includes('care')} 
                  onClick={() => toggleSection('care')}
                >
                  {product.shortDescription ? (
                     <div 
                      className="prose prose-sm max-w-none text-base leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: product.shortDescription }} 
                    />
                  ) : (
                    <p className="text-sm leading-relaxed">
                      Machine wash cold. Do not tumble dry.
                    </p>
                  )}
                </AccordionItem>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 border-none bg-transparent shadow-none">
          <DialogTitle className="sr-only">Product Image Preview</DialogTitle>
          <div className="relative w-full h-full min-h-[50vh] flex items-center justify-center">
            {previewImage && (
              <Image
                src={previewImage}
                alt="Product Preview"
                width={1200}
                height={1600}
                className="object-contain max-h-[90vh] w-auto h-auto rounded-md"
                priority
              />
            )}
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface AccordionItemProps {
  title: string;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function AccordionItem({ title, isOpen, onClick, children }: AccordionItemProps) {
  return (
    <div className="border-b border-neutral-300 last:border-b-0">
      <button 
        onClick={onClick}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors"
      >
        <span className="text-sm font-bold uppercase tracking-wide">{title}</span>
        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
      </button>
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
